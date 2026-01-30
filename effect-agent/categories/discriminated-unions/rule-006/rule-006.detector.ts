/**
 * rule-006: switch-on-tag
 *
 * Rule: Never check ._tag directly; use Schema.is(Variant)
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
	id: "rule-006",
	category: "discriminated-unions",
	originalName: "switch-on-tag",
	rule: "Never check ._tag directly; use Schema.is(Variant)",
	example: "Switch on _tag property",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never check ._tag directly; use Schema.is(Variant)
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for switch-on-tag
		// Checks for: switch (x._tag)

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
