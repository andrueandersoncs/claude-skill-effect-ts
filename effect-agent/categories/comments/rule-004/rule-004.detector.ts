/**
 * rule-004: function-documentation
 *
 * Rule: Never add JSDoc @param/@returns that just repeat the type signature
 * Category: comments
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
	category: "comments",
	originalName: "function-documentation",
	rule: "Never add JSDoc @param/@returns that just repeat the type signature",
	example: "Function documentation",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never add JSDoc @param/@returns that just repeat the type signature
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for function-documentation
		// Checks for: @param {string}, @returns

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "info",
	defaultCertainty: "potential",
	detect,
};

export default detector;
