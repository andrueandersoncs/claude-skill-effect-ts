/**
 * rule-009: splitting-array-by-condition
 *
 * Rule: Never filter twice with opposite conditions; use Array.partition
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
	id: "rule-009",
	category: "imperative",
	originalName: "splitting-array-by-condition",
	rule: "Never filter twice with opposite conditions; use Array.partition",
	example: "Splitting array by condition",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never filter twice with opposite conditions; use Array.partition
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for splitting-array-by-condition
		// Checks for: filter with opposite conditions

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
