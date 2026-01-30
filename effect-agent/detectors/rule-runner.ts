/**
 * Per-rule detector runner
 *
 * Discovers and runs individual rule detectors from category directories
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

// Cache for loaded detectors
const detectorCache = new Map<string, RuleDetector[]>();

/**
 * Dynamically load rule detectors from category directories
 */
export const loadCategoryDetectors = async (
	categoriesDir: string,
): Promise<Map<string, RuleDetector[]>> => {
	const result = new Map<string, RuleDetector[]>();

	if (!fs.existsSync(categoriesDir)) {
		return result;
	}

	const categories = fs
		.readdirSync(categoriesDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	for (const category of categories) {
		const categoryPath = path.join(categoriesDir, category);
		const detectors: RuleDetector[] = [];

		// Find all rule directories
		const ruleDirs = fs
			.readdirSync(categoryPath, { withFileTypes: true })
			.filter((d) => d.isDirectory() && d.name.startsWith("rule-"))
			.map((d) => d.name);

		for (const ruleDir of ruleDirs) {
			const detectorFile = path.join(
				categoryPath,
				ruleDir,
				`${ruleDir}.detector.ts`,
			);

			if (fs.existsSync(detectorFile)) {
				try {
					// Dynamic import
					const module = await import(detectorFile);
					if (module.detector || module.default) {
						detectors.push(module.detector || module.default);
					}
				} catch (error) {
					console.error(`Failed to load detector: ${detectorFile}`, error);
				}
			}
		}

		if (detectors.length > 0) {
			result.set(category, detectors);
		}
	}

	return result;
};

/**
 * Create detection context for a file
 */
export const createContext = (
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
 * Run all rule detectors on a single file
 */
export const detectFileWithRules = (
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
 * Check if file matches any pattern
 */
const matchesAny = (patterns: string[], filePath: string): boolean => {
	return patterns.some((pattern) => matchGlob(pattern, filePath));
};

/**
 * Recursively find all files
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
 * Severity levels for filtering
 */
const severityLevel: Record<ViolationSeverity, number> = {
	info: 0,
	warning: 1,
	error: 2,
};

/**
 * Run detection on a directory or file using per-rule detectors
 */
export const detectWithRules = async (
	target: string,
	categoriesDir: string,
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
	const allDetectors = await loadCategoryDetectors(categoriesDir);

	// Filter by categories if specified
	const detectors: RuleDetector[] = [];
	if (finalConfig.categories.length > 0) {
		for (const cat of finalConfig.categories) {
			const catDetectors = allDetectors.get(cat);
			if (catDetectors) {
				detectors.push(...catDetectors);
			}
		}
	} else {
		for (const catDetectors of allDetectors.values()) {
			detectors.push(...catDetectors);
		}
	}

	// Find files
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
		const { violations, error } = detectFileWithRules(
			file,
			sourceCode,
			detectors,
		);

		if (error) {
			result.errors.push({ filePath: file, error });
		}

		// Filter violations
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
 * Get all available rule IDs
 */
export const getAllRuleIds = async (
	categoriesDir: string,
): Promise<
	Array<{ category: string; ruleId: string; originalName: string }>
> => {
	const allDetectors = await loadCategoryDetectors(categoriesDir);
	const rules: Array<{
		category: string;
		ruleId: string;
		originalName: string;
	}> = [];

	for (const [category, detectors] of allDetectors) {
		for (const detector of detectors) {
			rules.push({
				category,
				ruleId: detector.meta.id,
				originalName: detector.meta.originalName,
			});
		}
	}

	return rules.sort((a, b) => {
		if (a.category !== b.category) {
			return a.category.localeCompare(b.category);
		}
		return a.ruleId.localeCompare(b.ruleId);
	});
};
