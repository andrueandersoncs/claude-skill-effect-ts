/**
 * rule-004: effect-fn-single-step
 *
 * Rule: Never use Effect.gen for simple single-step effects; use Effect.fn()
 * Category: code-style
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
	category: "code-style",
	originalName: "effect-fn-single-step",
	rule: "Never use Effect.gen for simple single-step effects; use Effect.fn()",
	example: "Single operation function",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use Effect.gen for simple single-step effects; use Effect.fn()
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-fn-single-step
		// Checks for: Effect.gen for single step

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
