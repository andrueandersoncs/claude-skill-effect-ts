/**
 * rule-005: multi-condition-matching
 *
 * Rule: Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is
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
	id: "rule-005",
	category: "conditionals",
	originalName: "multi-condition-matching",
	rule: "Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is",
	example: "Multi-condition object matching with Schema-defined predicates",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for multi-condition-matching
		// Checks for: if/else chains

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
