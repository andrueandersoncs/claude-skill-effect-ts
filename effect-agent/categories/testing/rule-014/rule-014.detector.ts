/**
 * rule-014: schema-constraints
 *
 * Rule: Never use fast-check .filter(); use Schema constraints
 * Category: testing
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "testing",
	originalName: "schema-constraints",
	rule: "Never use fast-check .filter(); use Schema constraints",
	example: "Complex Schema constraints",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use fast-check .filter(); use Schema constraints
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-constraints
		// Checks for: .filter(, fc.filter

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
