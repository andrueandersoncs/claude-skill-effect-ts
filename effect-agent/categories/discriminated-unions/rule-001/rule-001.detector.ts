/**
 * rule-001: match-tag-dispatch
 *
 * Rule: Never use if/else on ._tag; use Match.tag for discriminated unions
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
	id: "rule-001",
	category: "discriminated-unions",
	originalName: "match-tag-dispatch",
	rule: "Never use if/else on ._tag; use Match.tag for discriminated unions",
	example: "Simple event dispatch",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use if/else on ._tag; use Match.tag for discriminated unions
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for match-tag-dispatch
		// Checks for: if (x._tag ===

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
