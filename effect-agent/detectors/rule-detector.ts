/**
 * Rule-based detector interface
 *
 * Individual rule detectors follow this interface
 */

import type * as ts from "typescript";
import type {
	Violation,
	ViolationCertainty,
	ViolationSeverity,
} from "./types.js";

/**
 * Detection context passed to rule detectors
 */
export interface DetectionContext {
	/** File path being analyzed */
	filePath: string;
	/** Source code string */
	sourceCode: string;
	/** TypeScript source file AST */
	sourceFile: ts.SourceFile;
	/** Helper to get line/column from AST position */
	getPosition: (node: ts.Node) => { line: number; column: number };
}

/**
 * Rule metadata
 */
export interface RuleMetadata {
	/** Rule ID (e.g., "rule-001") */
	id: string;
	/** Category (e.g., "async", "errors") */
	category: string;
	/** Original name from migration (e.g., "callback-api") */
	originalName: string;
	/** Human-readable rule description */
	rule: string;
	/** Example context */
	example: string;
}

/**
 * Individual rule detector
 */
export interface RuleDetector {
	/** Rule metadata */
	meta: RuleMetadata;
	/** Default severity for violations */
	defaultSeverity: ViolationSeverity;
	/** Default certainty for violations */
	defaultCertainty: ViolationCertainty;
	/** Run detection on AST */
	detect: (context: DetectionContext) => Violation[];
}

/**
 * Create a helper to get position from AST node
 */
export const createPositionHelper = (sourceFile: ts.SourceFile) => {
	return (node: ts.Node): { line: number; column: number } => {
		const { line, character } = sourceFile.getLineAndCharacterOfPosition(
			node.getStart(),
		);
		return { line: line + 1, column: character + 1 };
	};
};

/**
 * Create a violation helper for a rule
 */
export const createViolationHelper = (
	meta: RuleMetadata,
	defaultSeverity: ViolationSeverity,
	defaultCertainty: ViolationCertainty,
) => {
	return (
		context: DetectionContext,
		node: ts.Node,
		message: string,
		suggestion?: string,
		overrides?: {
			severity?: ViolationSeverity;
			certainty?: ViolationCertainty;
		},
	): Violation => {
		const pos = context.getPosition(node);
		return {
			ruleId: meta.id,
			category: meta.category,
			message,
			filePath: context.filePath,
			line: pos.line,
			column: pos.column,
			snippet: node.getText(context.sourceFile).slice(0, 100),
			severity: overrides?.severity ?? defaultSeverity,
			certainty: overrides?.certainty ?? defaultCertainty,
			suggestion,
		};
	};
};
