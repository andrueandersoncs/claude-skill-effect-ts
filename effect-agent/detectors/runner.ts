/**
 * Rule violation detector runner
 *
 * Main entry point for running detection across files
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	getAllDetectors,
	getCategoryNames,
	getDetector,
	initializeDetectors,
} from "./categories/index.js";
import type {
	CategoryDetector,
	DetectorConfig,
	DetectorResult,
	Violation,
} from "./types.js";

// Get the directory where this module is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const categoriesDir = path.join(__dirname, "..", "categories");

/**
 * Example files for a rule
 */
interface RuleExamples {
	good: { path: string; content: string } | null;
	bad: { path: string; content: string } | null;
}

/**
 * Load example files for a rule
 * - {ruleId}.ts = good example
 * - {ruleId}.bad.ts = bad example
 */
const loadRuleExamples = (category: string, ruleId: string): RuleExamples => {
	const result: RuleExamples = { good: null, bad: null };

	const goodPath = path.join(categoriesDir, category, ruleId, `${ruleId}.ts`);
	const badPath = path.join(
		categoriesDir,
		category,
		ruleId,
		`${ruleId}.bad.ts`,
	);

	try {
		if (fs.existsSync(goodPath)) {
			result.good = {
				path: `${ruleId}.ts`,
				content: fs.readFileSync(goodPath, "utf-8"),
			};
		}
	} catch {
		// Ignore errors reading example files
	}

	try {
		if (fs.existsSync(badPath)) {
			result.bad = {
				path: `${ruleId}.bad.ts`,
				content: fs.readFileSync(badPath, "utf-8"),
			};
		}
	} catch {
		// Ignore errors reading example files
	}

	return result;
};

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
		return filePath.endsWith(`/${suffix}`) || filePath === suffix;
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
			return filePath.includes(`/${part}/`) || filePath.startsWith(`${part}/`);
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
		includePotential: config.includePotential ?? true,
	};

	// Determine which detectors to use
	const detectors =
		finalConfig.categories.length > 0
			? finalConfig.categories
					.map(getDetector)
					.filter((d): d is CategoryDetector => d !== undefined)
			: getAllDetectors();

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

		// Filter violations by certainty
		const filtered = violations.filter((v) => {
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
 * Deduplicate violations by location and rule
 * When same location has multiple violations for same rule, keep the first one
 */
const deduplicateViolations = (violations: Violation[]): Violation[] => {
	const seen = new Set<string>();
	const result: Violation[] = [];

	for (const v of violations) {
		const key = `${v.filePath}:${v.line}:${v.column}:${v.ruleId}`;
		if (!seen.has(key)) {
			seen.add(key);
			result.push(v);
		}
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
			lines.push("  Violation:");
			lines.push(`    Line: ${v.line}:${v.column}`);
			lines.push(`    Rule: ${v.category}/${v.ruleId}`);
			lines.push(`    Certainty: ${v.certainty}`);
			lines.push(`    Message: ${v.message}`);
			if (v.suggestion) {
				lines.push(`    Suggestion: ${v.suggestion}`);
			}
			lines.push("    Offending Snippet:");
			const snippetLines = v.snippet.split("\n");
			for (const snippetLine of snippetLines) {
				lines.push(`      ${snippetLine}`);
			}
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
	const byCertainty = new Map<string, number>();

	for (const v of result.violations) {
		byCategory.set(v.category, (byCategory.get(v.category) ?? 0) + 1);
		byCertainty.set(v.certainty, (byCertainty.get(v.certainty) ?? 0) + 1);
	}

	const lines: string[] = [
		"\n═══════════════════════════════════════════════════════════════",
		"                        SUMMARY",
		"═══════════════════════════════════════════════════════════════",
		`Files analyzed: ${result.filesAnalyzed}`,
		`Total violations: ${result.violations.length}`,
		"",
		"By certainty:",
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
 * Format examples for a rule
 */
export const formatRuleExamples = (ruleSpec: string): string => {
	// Parse rule spec: "category/rule-id" or just "rule-id"
	const parts = ruleSpec.split("/");
	let category: string;
	let ruleId: string;

	if (parts.length === 2) {
		[category, ruleId] = parts;
	} else {
		// Try to find the rule in any category
		ruleId = parts[0];
		const allCategories = getCategoryNames();
		const found = allCategories.find((cat) => {
			const examples = loadRuleExamples(cat, ruleId);
			return examples.bad || examples.good;
		});
		if (!found) {
			return `Rule "${ruleSpec}" not found. Use format: category/rule-id (e.g., code-style/rule-002)`;
		}
		category = found;
	}

	const examples = loadRuleExamples(category, ruleId);

	if (!examples.bad && !examples.good) {
		return `No examples found for rule "${category}/${ruleId}"`;
	}

	const lines: string[] = [];
	lines.push(`\nExamples for: ${category}/${ruleId}`);
	lines.push("═".repeat(60));

	if (examples.bad) {
		lines.push(`\nBad Example: ${examples.bad.path}`);
		lines.push("─".repeat(40));
		lines.push(examples.bad.content);
	}

	if (examples.good) {
		lines.push(`\nGood Example: ${examples.good.path}`);
		lines.push("─".repeat(40));
		lines.push(examples.good.content);
	}

	lines.push(`\n${"═".repeat(60)}`);
	return lines.join("\n");
};

/**
 * CLI entry point
 */
export const main = async () => {
	// Initialize per-rule detectors
	await initializeDetectors();
	const args = process.argv.slice(2);

	// Check for examples subcommand
	if (args[0] === "examples") {
		const ruleSpec = args[1];
		if (!ruleSpec) {
			console.log(
				"Usage: bun run detectors/runner.ts examples <category/rule-id>",
			);
			console.log(
				"Example: bun run detectors/runner.ts examples code-style/rule-002",
			);
			process.exit(1);
		}
		console.log(formatRuleExamples(ruleSpec));
		process.exit(0);
	}

	// Parse arguments
	let directory = process.cwd();
	let categories: string[] = [];
	let includePotential = true;
	let outputFormat: "text" | "json" = "text";

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--help" || arg === "-h") {
			console.log(`
Effect-TS Rule Violation Detector

Usage: bun run detectors/runner.ts [options] [directory]
       bun run detectors/runner.ts examples <category/rule-id>

Commands:
  examples <rule>           Show good/bad examples for a rule

Options:
  --categories, -c <list>   Comma-separated categories to check
  --no-potential            Exclude potential violations (only show definite)
  --json                    Output as JSON
  --help, -h                Show this help

Available categories:
  ${getCategoryNames().join(", ")}

Examples:
  bun run detectors/runner.ts ./src
  bun run detectors/runner.ts -c imperative,conditionals ./src
  bun run detectors/runner.ts --no-potential ./src
  bun run detectors/runner.ts examples code-style/rule-002
`);
			process.exit(0);
		}

		if (arg === "--categories" || arg === "-c") {
			categories = args[++i]?.split(",") ?? [];
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
		includePotential,
	});

	// Deduplicate violations (same location + same rule = single violation)
	const dedupedViolations = deduplicateViolations(result.violations);
	const dedupedResult = { ...result, violations: dedupedViolations };

	// Output results
	if (outputFormat === "json") {
		console.log(JSON.stringify(dedupedResult, null, 2));
	} else {
		console.log(formatViolations(dedupedViolations));
		console.log(formatSummary(dedupedResult));
	}

	// Exit with error code if violations found
	process.exit(result.violations.length > 0 ? 1 : 0);
};

// Run if executed directly
const isMain =
	process.argv[1]?.endsWith("runner.ts") ||
	process.argv[1]?.endsWith("runner.js");
if (isMain) {
	main().catch(console.error);
}
