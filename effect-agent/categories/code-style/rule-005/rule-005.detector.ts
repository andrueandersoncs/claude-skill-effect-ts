/**
 * rule-005: effect-fn-transformation
 *
 * Rule: Never write plain functions; use Effect.fn() or Effect.gen()
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
	id: "rule-005",
	category: "code-style",
	originalName: "effect-fn-transformation",
	rule: "Never write plain functions; use Effect.fn() or Effect.gen()",
	example: "Simple data transformation",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never write plain functions; use Effect.fn() or Effect.gen()
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-fn-transformation
		// Checks for: plain functions returning Effect

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
