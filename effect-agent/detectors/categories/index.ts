/**
 * Category detectors index
 *
 * Loads per-rule detectors from categories/{category}/rule-XXX/rule-XXX.detector.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

/**
 * Type for per-rule detector function
 */
type RuleDetector = (
	filePath: string,
	sourceFile: ts.SourceFile,
) => Violation[];

/**
 * Cache for loaded detectors
 */
const detectorCache = new Map<string, RuleDetector[]>();

/**
 * Categories directory path
 */
const categoriesDir = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	"../../categories",
);

/**
 * Get all category names from the categories directory
 */
export const getCategoryNames = (): string[] => {
	try {
		return fs
			.readdirSync(categoriesDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
			.filter((name) => !name.startsWith("."));
	} catch {
		return [];
	}
};

/**
 * Load all rule detectors for a category
 */
const loadCategoryDetectors = async (
	category: string,
): Promise<RuleDetector[]> => {
	if (detectorCache.has(category)) {
		return detectorCache.get(category) ?? [];
	}

	const detectors: RuleDetector[] = [];
	const categoryPath = path.join(categoriesDir, category);

	try {
		const entries = fs.readdirSync(categoryPath, { withFileTypes: true });

		for (const entry of entries) {
			if (entry.isDirectory() && entry.name.startsWith("rule-")) {
				const detectorFile = path.join(
					categoryPath,
					entry.name,
					`${entry.name}.detector.ts`,
				);
				const detectorFileJs = path.join(
					categoryPath,
					entry.name,
					`${entry.name}.detector.js`,
				);

				// Try .js first (compiled), then .ts
				let modulePath = detectorFileJs;
				if (!fs.existsSync(modulePath)) {
					modulePath = detectorFile;
				}

				if (fs.existsSync(modulePath)) {
					try {
						const module = await import(modulePath);
						if (typeof module.detect === "function") {
							detectors.push(module.detect);
						}
					} catch (err) {
						// Skip detectors that fail to load
						console.error(`Failed to load detector ${modulePath}:`, err);
					}
				}
			}
		}
	} catch {
		// Category doesn't exist
	}

	detectorCache.set(category, detectors);
	return detectors;
};

/**
 * Create a CategoryDetector from per-rule detectors
 */
const createCategoryDetector = (category: string): CategoryDetector => {
	return {
		category,
		description: `Detects violations in ${category} category`,
		detect: (filePath: string, sourceCode: string): Violation[] => {
			const violations: Violation[] = [];

			// Create SourceFile once
			const sourceFile = ts.createSourceFile(
				filePath,
				sourceCode,
				ts.ScriptTarget.Latest,
				true,
			);

			// Run all rule detectors synchronously
			// (They're already loaded at this point)
			const ruleDetectors = detectorCache.get(category) ?? [];
			for (const detect of ruleDetectors) {
				try {
					const detected = detect(filePath, sourceFile);
					violations.push(...detected);
				} catch {
					// Skip detector errors
				}
			}

			return violations;
		},
	};
};

/**
 * Initialize all detectors (must be called before using)
 */
export const initializeDetectors = async (): Promise<void> => {
	const categories = getCategoryNames();
	await Promise.all(categories.map(loadCategoryDetectors));
};

/**
 * All available category detectors
 * Note: initializeDetectors() must be called first
 */
export const getAllDetectors = (): CategoryDetector[] => {
	return getCategoryNames().map(createCategoryDetector);
};

/**
 * Get detector by category name
 */
export const getDetector = (category: string): CategoryDetector | undefined => {
	if (!getCategoryNames().includes(category)) {
		return undefined;
	}
	return createCategoryDetector(category);
};
