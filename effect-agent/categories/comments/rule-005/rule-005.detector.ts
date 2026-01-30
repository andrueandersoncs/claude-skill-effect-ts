/**
 * rule-005: function-implementation
 *
 * Rule: Never add comments describing WHAT code does; the code itself shows that
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
	id: "rule-005",
	category: "comments",
	originalName: "function-implementation",
	rule: "Never add comments describing WHAT code does; the code itself shows that",
	example: "Function implementation",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never add comments describing WHAT code does; the code itself shows that
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for function-implementation
		// Checks for: // convert, // calculate, // check

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
