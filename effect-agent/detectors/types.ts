/**
 * Rule violation detection types
 */

export type ViolationSeverity = "error" | "warning" | "info";

export type ViolationCertainty = "definite" | "potential";

export interface Violation {
	/** Rule ID that was violated */
	ruleId: string;
	/** Category the rule belongs to */
	category: string;
	/** Human-readable description of the violation */
	message: string;
	/** File path where violation was found */
	filePath: string;
	/** Line number (1-indexed) */
	line: number;
	/** Column number (1-indexed) */
	column: number;
	/** The violating code snippet */
	snippet: string;
	/** How severe is this violation */
	severity: ViolationSeverity;
	/** Is this definitely a violation or potentially one */
	certainty: ViolationCertainty;
	/** Suggested fix or alternative */
	suggestion?: string;
}

export interface DetectorResult {
	/** Total files analyzed */
	filesAnalyzed: number;
	/** All violations found */
	violations: Violation[];
	/** Errors encountered during analysis */
	errors: Array<{ filePath: string; error: string }>;
}

export interface CategoryDetector {
	/** Category name */
	category: string;
	/** Human-readable description */
	description: string;
	/** Run detection on a file */
	detect: (filePath: string, sourceCode: string) => Violation[];
}

export interface DetectorConfig {
	/** File patterns to include */
	include: string[];
	/** File patterns to exclude */
	exclude: string[];
	/** Categories to check (empty = all) */
	categories: string[];
	/** Minimum severity to report */
	minSeverity: ViolationSeverity;
	/** Whether to include potential violations */
	includePotential: boolean;
}

export const defaultConfig: DetectorConfig = {
	include: ["**/*.ts", "**/*.tsx"],
	exclude: ["**/node_modules/**", "**/*.d.ts", "**/dist/**"],
	categories: [],
	minSeverity: "warning",
	includePotential: true,
};
