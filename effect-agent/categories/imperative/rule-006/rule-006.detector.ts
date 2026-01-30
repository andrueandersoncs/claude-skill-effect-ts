/**
 * rule-006: flattening-nested-arrays
 *
 * Rule: Never use nested for loops; use Array.flatMap
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
	id: "rule-006",
	category: "imperative",
	originalName: "flattening-nested-arrays",
	rule: "Never use nested for loops; use Array.flatMap",
	example: "Flattening nested arrays",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never use nested for loops; use Array.flatMap
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for flattening-nested-arrays
		// Checks for: nested for loops

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "potential",
	detect,
};

export default detector;
