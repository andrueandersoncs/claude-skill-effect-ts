/**
 * Rule violation detector runner
 *
 * Main entry point for running detection across files
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
	allDetectors,
	getCategoryNames,
	getDetector,
} from "./categories/index.js";
import type {
	CategoryDetector,
	DetectorConfig,
	DetectorResult,
	Violation,
	ViolationSeverity,
} from "./types.js";

/**
 * Glob pattern matching (simple implementation)
 */
const matchGlob = (pattern: string, filePath: string): boolean => {
	// Handle common glob patterns
	// **/*.ts matches any .ts file at any depth
	// *.ts matches .ts files in current dir only
	// **/node_modules/** matches node_modules at any depth

	// Simple extension matching for **/*.ext patterns
	if (pattern.startsWith("**/") && !pattern.slice(3).includes("/")) {
		// Pattern like **/*.ts - match any file ending with the suffix
		const suffix = pattern.slice(3); // Remove **/
		if (suffix.startsWith("*")) {
			// Pattern like **/*.ts
			const ext = suffix.slice(1); // Remove *
			return filePath.endsWith(ext);
		}
		// Pattern like **/foo.ts - match exact filename anywhere
		return filePath.endsWith("/" + suffix) || filePath === suffix;
	}

	// Pattern like **/*.d.ts - handle multiple extensions
	if (pattern.startsWith("**/*")) {
		const ext = pattern.slice(4); // Get extension part like .d.ts
		return filePath.endsWith(ext);
	}

	// For exclude patterns like **/node_modules/**
	if (pattern.includes("**")) {
		const parts = pattern.split("**").filter(Boolean);
		if (parts.length === 1) {
			// Just check if the path contains the part
			const part = parts[0].replace(/^\/|\/$/g, "");
			return filePath.includes("/" + part + "/") || filePath.startsWith(part + "/");
		}
	}

	// Simple wildcard matching
	const regexPattern = pattern
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, ".*")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, ".");

	return new RegExp(`^${regexPattern}$`).test(filePath);
};

/**
 * Check if file matches any pattern in the list
 */
const matchesAny = (patterns: string[], filePath: string): boolean => {
	return patterns.some((pattern) => matchGlob(pattern, filePath));
};

/**
 * Recursively find all files in directory
 */
const findFiles = (
	dir: string,
	include: string[],
	exclude: string[],
): string[] => {
	const results: string[] = [];

	const walk = (currentDir: string) => {
		const entries = fs.readdirSync(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name);
			const relativePath = path.relative(dir, fullPath);

			if (entry.isDirectory()) {
				// Skip excluded directories early
				if (
					!matchesAny(exclude, relativePath) &&
					!matchesAny(exclude, `${relativePath}/`)
				) {
					walk(fullPath);
				}
			} else if (entry.isFile()) {
				if (
					matchesAny(include, relativePath) &&
					!matchesAny(exclude, relativePath)
				) {
					results.push(fullPath);
				}
			}
		}
	};

	walk(dir);
	return results;
};

/**
 * Severity comparison for filtering
 */
const severityLevel: Record<ViolationSeverity, number> = {
	info: 0,
	warning: 1,
	error: 2,
};

/**
 * Run detection on a single file
 */
export const detectFile = (
	filePath: string,
	detectors: CategoryDetector[],
): { violations: Violation[]; error?: string } => {
	try {
		const sourceCode = fs.readFileSync(filePath, "utf-8");
		const violations: Violation[] = [];

		for (const detector of detectors) {
			const detected = detector.detect(filePath, sourceCode);
			violations.push(...detected);
		}

		return { violations };
	} catch (error) {
		return {
			violations: [],
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

/**
 * Run detection on a directory or file
 */
export const detectDirectory = (
	target: string,
	config: Partial<DetectorConfig> = {},
): DetectorResult => {
	const finalConfig: DetectorConfig = {
		include: config.include ?? ["**/*.ts", "**/*.tsx"],
		exclude: config.exclude ?? [
			"**/node_modules/**",
			"**/*.d.ts",
			"**/dist/**",
		],
		categories: config.categories ?? [],
		minSeverity: config.minSeverity ?? "warning",
		includePotential: config.includePotential ?? true,
	};

	// Determine which detectors to use
	const detectors =
		finalConfig.categories.length > 0
			? finalConfig.categories
					.map(getDetector)
					.filter((d): d is CategoryDetector => d !== undefined)
			: allDetectors;

	// Check if target is a file or directory
	const stat = fs.statSync(target);
	const files = stat.isFile()
		? [target]
		: findFiles(target, finalConfig.include, finalConfig.exclude);

	const result: DetectorResult = {
		filesAnalyzed: 0,
		violations: [],
		errors: [],
	};

	// Process each file
	for (const file of files) {
		result.filesAnalyzed++;
		const { violations, error } = detectFile(file, detectors);

		if (error) {
			result.errors.push({ filePath: file, error });
		}

		// Filter violations by severity and certainty
		const filtered = violations.filter((v) => {
			if (severityLevel[v.severity] < severityLevel[finalConfig.minSeverity]) {
				return false;
			}
			if (!finalConfig.includePotential && v.certainty === "potential") {
				return false;
			}
			return true;
		});

		result.violations.push(...filtered);
	}

	return result;
};

/**
 * Format violations for console output
 */
export const formatViolations = (violations: Violation[]): string => {
	if (violations.length === 0) {
		return "No violations found.";
	}

	const grouped = new Map<string, Violation[]>();

	for (const v of violations) {
		const key = v.filePath;
		if (!grouped.has(key)) {
			grouped.set(key, []);
		}
		grouped.get(key)?.push(v);
	}

	const lines: string[] = [];

	for (const [file, fileViolations] of grouped) {
		lines.push(`\n${file}`);
		lines.push("─".repeat(Math.min(file.length, 80)));

		for (const v of fileViolations) {
			const certaintyTag = v.certainty === "potential" ? " [potential]" : "";
			const severityIcon =
				v.severity === "error" ? "❌" : v.severity === "warning" ? "⚠️ " : "ℹ️ ";

			lines.push(
				`  ${severityIcon} ${v.line}:${v.column} [${v.category}/${v.ruleId}]${certaintyTag}`,
			);
			lines.push(`     ${v.message}`);
			if (v.suggestion) {
				lines.push(`     💡 ${v.suggestion}`);
			}
			lines.push(`     ${v.snippet.replace(/\n/g, " ").slice(0, 60)}...`);
			lines.push("");
		}
	}

	return lines.join("\n");
};

/**
 * Format summary statistics
 */
export const formatSummary = (result: DetectorResult): string => {
	const byCategory = new Map<string, number>();
	const bySeverity = new Map<ViolationSeverity, number>();
	const byCertainty = new Map<string, number>();

	for (const v of result.violations) {
		byCategory.set(v.category, (byCategory.get(v.category) ?? 0) + 1);
		bySeverity.set(v.severity, (bySeverity.get(v.severity) ?? 0) + 1);
		byCertainty.set(v.certainty, (byCertainty.get(v.certainty) ?? 0) + 1);
	}

	const lines: string[] = [
		"\n═══════════════════════════════════════════════════════════════",
		"                        SUMMARY",
		"═══════════════════════════════════════════════════════════════",
		`Files analyzed: ${result.filesAnalyzed}`,
		`Total violations: ${result.violations.length}`,
		`  ❌ Errors: ${bySeverity.get("error") ?? 0}`,
		`  ⚠️  Warnings: ${bySeverity.get("warning") ?? 0}`,
		`  ℹ️  Info: ${bySeverity.get("info") ?? 0}`,
		"",
		`Certainty:`,
		`  Definite: ${byCertainty.get("definite") ?? 0}`,
		`  Potential: ${byCertainty.get("potential") ?? 0}`,
		"",
		"By category:",
	];

	const sortedCategories = [...byCategory.entries()].sort(
		(a, b) => b[1] - a[1],
	);
	for (const [category, count] of sortedCategories) {
		lines.push(`  ${category}: ${count}`);
	}

	if (result.errors.length > 0) {
		lines.push("");
		lines.push(`Errors during analysis: ${result.errors.length}`);
		for (const err of result.errors.slice(0, 5)) {
			lines.push(`  ${err.filePath}: ${err.error}`);
		}
		if (result.errors.length > 5) {
			lines.push(`  ... and ${result.errors.length - 5} more`);
		}
	}

	lines.push("═══════════════════════════════════════════════════════════════");

	return lines.join("\n");
};

/**
 * CLI entry point
 */
export const main = () => {
	const args = process.argv.slice(2);

	// Parse arguments
	let directory = process.cwd();
	let categories: string[] = [];
	let minSeverity: ViolationSeverity = "warning";
	let includePotential = true;
	let outputFormat: "text" | "json" = "text";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--help" || arg === "-h") {
			console.log(`
Effect-TS Rule Violation Detector

Usage: bun run detectors/runner.ts [options] [directory]

Options:
  --categories, -c <list>   Comma-separated categories to check
  --severity, -s <level>    Minimum severity: info, warning, error (default: warning)
  --no-potential            Exclude potential violations (only show definite)
  --json                    Output as JSON
  --help, -h                Show this help

Available categories:
  ${getCategoryNames().join(", ")}

Examples:
  bun run detectors/runner.ts ./src
  bun run detectors/runner.ts -c imperative,conditionals ./src
  bun run detectors/runner.ts -s error --no-potential ./src
`);
			process.exit(0);
		}

		if (arg === "--categories" || arg === "-c") {
			categories = args[++i]?.split(",") ?? [];
		} else if (arg === "--severity" || arg === "-s") {
			minSeverity = (args[++i] as ViolationSeverity) ?? "warning";
		} else if (arg === "--no-potential") {
			includePotential = false;
		} else if (arg === "--json") {
			outputFormat = "json";
		} else if (!arg.startsWith("-")) {
			directory = path.resolve(arg);
		}
	}

	// Run detection
	const result = detectDirectory(directory, {
		categories,
		minSeverity,
		includePotential,
	});

	// Output results
	if (outputFormat === "json") {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(formatViolations(result.violations));
		console.log(formatSummary(result));
	}

	// Exit with error code if violations found
	const errorCount = result.violations.filter(
		(v) => v.severity === "error",
	).length;
	process.exit(errorCount > 0 ? 1 : 0);
};

// Run if executed directly
const isMain =
	process.argv[1]?.endsWith("runner.ts") ||
	process.argv[1]?.endsWith("runner.js");
if (isMain) {
	main();
}
