/**
 * rule-004: schema-is-vs-match-tag
 *
 * Rule: Never use Match.tag when you need class methods; use Schema.is()
 * Category: discriminated-unions
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
	category: "discriminated-unions",
	originalName: "schema-is-vs-match-tag",
	rule: "Never use Match.tag when you need class methods; use Schema.is()",
	example: "Choosing between Schema.is() and Match.tag",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use Match.tag when you need class methods; use Schema.is()
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-is-vs-match-tag
		// Checks for: Match.tag with methods

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
