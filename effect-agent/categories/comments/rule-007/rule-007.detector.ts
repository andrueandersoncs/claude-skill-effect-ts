/**
 * rule-007: naming-over-commenting
 *
 * Rule: Never add comments that could be replaced by better variable or function names
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
	id: "rule-007",
	category: "comments",
	originalName: "naming-over-commenting",
	rule: "Never add comments that could be replaced by better variable or function names",
	example: "Naming over commenting",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never add comments that could be replaced by better variable or function names
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for naming-over-commenting
		// Checks for: // this is

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
