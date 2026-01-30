/**
 * rule-007: it-effect
 *
 * Rule: Never use Effect.runPromise in tests; use it.effect from @effect/vitest
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
	id: "rule-007",
	category: "testing",
	originalName: "it-effect",
	rule: "Never use Effect.runPromise in tests; use it.effect from @effect/vitest",
	example: "Test with service dependencies",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use Effect.runPromise in tests; use it.effect from @effect/vitest
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for it-effect
		// Checks for: Effect.runPromise in test

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
