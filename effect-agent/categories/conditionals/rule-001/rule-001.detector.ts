/**
 * rule-001: array-empty-check
 *
 * Rule: Never use array empty checks; use Array.match
 * Category: conditionals
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "conditionals",
	originalName: "array-empty-check",
	rule: "Never use array empty checks; use Array.match",
	example: "First element with fallback",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use array empty checks; use Array.match
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for array-empty-check
		// Checks for: array.length === 0, array.length > 0

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
