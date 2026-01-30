/**
 * Rule violation detector runner
 *
 * Main entry point for running detection across files using per-rule detectors
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import type { DetectionContext, RuleDetector } from "./rule-detector.js";
import { createPositionHelper } from "./rule-detector.js";
import type {
	DetectorConfig,
	DetectorResult,
	Violation,
	ViolationSeverity,
} from "./types.js";

// Resolve categories directory relative to this file
const CATEGORIES_DIR = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	"../categories",
);

// Cache for loaded detectors
let cachedDetectors: Map<string, RuleDetector[]> | null = null;

/**
 * Dynamically load rule detectors from category directories
 */
const loadCategoryDetectors = async (): Promise<
	Map<string, RuleDetector[]>
> => {
	if (cachedDetectors) {
		return cachedDetectors;
	}

	const result = new Map<string, RuleDetector[]>();

	if (!fs.existsSync(CATEGORIES_DIR)) {
		console.error(`Categories directory not found: ${CATEGORIES_DIR}`);
		return result;
	}

	const categories = fs
		.readdirSync(CATEGORIES_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	for (const category of categories) {
		const categoryPath = path.join(CATEGORIES_DIR, category);
		const detectors: RuleDetector[] = [];

		// Find all rule directories
		const ruleDirs = fs
			.readdirSync(categoryPath, { withFileTypes: true })
			.filter((d) => d.isDirectory() && d.name.startsWith("rule-"))
			.map((d) => d.name)
			.sort();

		for (const ruleDir of ruleDirs) {
			const detectorFile = path.join(
				categoryPath,
				ruleDir,
				`${ruleDir}.detector.ts`,
			);

			if (fs.existsSync(detectorFile)) {
				try {
					const module = await import(detectorFile);
					if (module.detector || module.default) {
						detectors.push(module.detector || module.default);
					}
				} catch (error) {
					// Silently skip detectors that fail to load
				}
			}
		}

		if (detectors.length > 0) {
			result.set(category, detectors);
		}
	}

	cachedDetectors = result;
	return result;
};

/**
 * Get all category names
 */
export const getCategoryNames = async (): Promise<string[]> => {
	const detectors = await loadCategoryDetectors();
	return [...detectors.keys()].sort();
};

/**
 * Get detectors for a specific category
 */
export const getCategoryDetectors = async (
	category: string,
): Promise<RuleDetector[]> => {
	const detectors = await loadCategoryDetectors();
	return detectors.get(category) ?? [];
};

/**
 * Get all detectors
 */
export const getAllDetectors = async (): Promise<RuleDetector[]> => {
	const detectors = await loadCategoryDetectors();
	const all: RuleDetector[] = [];
	for (const categoryDetectors of detectors.values()) {
		all.push(...categoryDetectors);
	}
	return all;
};

/**
 * Glob pattern matching (simple implementation)
 */
const matchGlob = (pattern: string, filePath: string): boolean => {
	if (pattern.startsWith("**/") && !pattern.slice(3).includes("/")) {
		const suffix = pattern.slice(3);
		if (suffix.startsWith("*")) {
			const ext = suffix.slice(1);
			return filePath.endsWith(ext);
		}
		return filePath.endsWith("/" + suffix) || filePath === suffix;
	}

	if (pattern.startsWith("**/*")) {
		const ext = pattern.slice(4);
		return filePath.endsWith(ext);
	}

	if (pattern.includes("**")) {
		const parts = pattern.split("**").filter(Boolean);
		if (parts.length === 1) {
			const part = parts[0].replace(/^\/|\/$/g, "");
			return (
				filePath.includes("/" + part + "/") || filePath.startsWith(part + "/")
			);
		}
	}

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
 * Create detection context for a file
 */
const createContext = (
	filePath: string,
	sourceCode: string,
): DetectionContext => {
	const sourceFile = ts.createSourceFile(
		filePath,
		sourceCode,
		ts.ScriptTarget.Latest,
		true,
	);

	return {
		filePath,
		sourceCode,
		sourceFile,
		getPosition: createPositionHelper(sourceFile),
	};
};

/**
 * Run detection on a single file
 */
export const detectFile = (
	filePath: string,
	sourceCode: string,
	detectors: RuleDetector[],
): { violations: Violation[]; error?: string } => {
	try {
		const context = createContext(filePath, sourceCode);
		const violations: Violation[] = [];

		for (const detector of detectors) {
			const detected = detector.detect(context);
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
export const detectDirectory = async (
	target: string,
	config: Partial<DetectorConfig> = {},
): Promise<DetectorResult> => {
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

	// Load detectors
	const allCategoryDetectors = await loadCategoryDetectors();

	// Determine which detectors to use
	const detectors: RuleDetector[] = [];
	if (finalConfig.categories.length > 0) {
		for (const cat of finalConfig.categories) {
			const catDetectors = allCategoryDetectors.get(cat);
			if (catDetectors) {
				detectors.push(...catDetectors);
			}
		}
	} else {
		for (const catDetectors of allCategoryDetectors.values()) {
			detectors.push(...catDetectors);
		}
	}

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
		const sourceCode = fs.readFileSync(file, "utf-8");
		const { violations, error } = detectFile(file, sourceCode, detectors);

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
export const main = async () => {
	const args = process.argv.slice(2);

	// Parse arguments
	let directory = process.cwd();
	let categories: string[] = [];
	let minSeverity: ViolationSeverity = "warning";
	let includePotential = true;
	let outputFormat: "text" | "json" = "text";

	const categoryNames = await getCategoryNames();

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
  ${categoryNames.join(", ")}

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
	const result = await detectDirectory(directory, {
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
