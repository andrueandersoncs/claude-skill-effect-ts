/**
 * rule-010: ternary-to-match
 *
 * Rule: Never use ternary operators; define Schema types for each range and use Match.when with Schema.is
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
	id: "rule-010",
	category: "conditionals",
	originalName: "ternary-to-match",
	rule: "Never use ternary operators; define Schema types for each range and use Match.when with Schema.is",
	example: "Nested ternary replaced with Schema-defined score ranges",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use ternary operators; define Schema types for each range and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for ternary-to-match
		// Checks for: ternary operators

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "potential",
	detect,
};

export default detector;
