/**
 * rule-013: tagged-union-state
 *
 * Rule: Never use optional properties for state; use tagged unions
 * Category: schema
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "schema",
	originalName: "tagged-union-state",
	rule: "Never use optional properties for state; use tagged unions",
	example: "Order status with optional fields",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use optional properties for state; use tagged unions
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for tagged-union-state
		// Checks for: optional properties for state

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
