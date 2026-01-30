/**
 * rule-002: match-literal-union
 *
 * Rule: Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is
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
	id: "rule-002",
	category: "conditionals",
	originalName: "match-literal-union",
	rule: "Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is",
	example: "Matching any of several values with Schema.Literal union",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for match-literal-union
		// Checks for: || chains, value === a || value === b

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
