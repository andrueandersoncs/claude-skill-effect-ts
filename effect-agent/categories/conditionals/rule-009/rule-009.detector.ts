/**
 * rule-009: switch-to-match-tag
 *
 * Rule: Never use switch/case statements; use Match.type with Match.tag for discriminated unions
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
	id: "rule-009",
	category: "conditionals",
	originalName: "switch-to-match-tag",
	rule: "Never use switch/case statements; use Match.type with Match.tag for discriminated unions",
	example: "Discriminated union event handling",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use switch/case statements; use Match.type with Match.tag for discriminated unions
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect switch statements
		if (ts.isSwitchStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"switch/case statements should be replaced with Match.type",
					"Use Match.type() with Match.tag() for discriminated unions",
				),
			);
		}

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "definite",
	detect,
};

export default detector;
