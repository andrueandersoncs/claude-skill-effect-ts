/**
 * rule-006: legitimate-why-comment
 *
 * Rule: Only add comments explaining WHY when the reason isn't obvious from context
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
	id: "rule-006",
	category: "comments",
	originalName: "legitimate-why-comment",
	rule: "Only add comments explaining WHY when the reason isn't obvious from context",
	example: "Legitimate why comment",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Only add comments explaining WHY when the reason isn't obvious from context
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for legitimate-why-comment
		// Checks for:

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
