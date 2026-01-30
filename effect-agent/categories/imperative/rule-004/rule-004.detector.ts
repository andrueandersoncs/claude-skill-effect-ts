/**
 * rule-004: conditional-accumulation
 *
 * Rule: Never use for...of/for...in; use Array module functions
 * Category: imperative
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "imperative",
	originalName: "conditional-accumulation",
	rule: "Never use for...of/for...in; use Array module functions",
	example: "Conditional accumulation",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use for...of/for...in; use Array module functions
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for conditional-accumulation
		// Checks for: for...of with condition, for...in

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
