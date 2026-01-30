/**
 * rule-004: multi-condition-assignment
 *
 * Rule: Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is
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
	id: "rule-004",
	category: "conditionals",
	originalName: "multi-condition-assignment",
	rule: "Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is",
	example: "Multi-condition assignment with Schema-defined conditions",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for multi-condition-assignment
		// Checks for: variable reassignment in if/else

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
