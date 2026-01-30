/**
 * rule-004: conditional-fail
 *
 * Rule: Never use throw statements; use Effect.fail()
 * Category: errors
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
	category: "errors",
	originalName: "conditional-fail",
	rule: "Never use throw statements; use Effect.fail()",
	example: "Conditional throw based on state",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use throw statements; use Effect.fail()
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for conditional-fail
		// Checks for: throw in if block

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
