/**
 * rule-008: schema-literal
 *
 * Rule: Never use TypeScript enum; use Schema.Literal
 * Category: schema
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "schema",
	originalName: "schema-literal",
	rule: "Never use TypeScript enum; use Schema.Literal",
	example: "Converting TypeScript enums",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use TypeScript enum; use Schema.Literal
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-literal
		// Checks for: TypeScript enum

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "definite",
	detect,
};

export default detector;
