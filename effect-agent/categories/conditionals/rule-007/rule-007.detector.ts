/**
 * rule-007: numeric-classification
 *
 * Rule: Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is
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
	id: "rule-007",
	category: "conditionals",
	originalName: "numeric-classification",
	rule: "Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is",
	example: "Numeric classification with Schema-defined ranges",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for numeric-classification
		// Checks for: if with < > comparisons

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
