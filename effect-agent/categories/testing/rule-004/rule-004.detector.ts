/**
 * rule-004: effect-vitest-imports
 *
 * Rule: Never import from vitest directly; use @effect/vitest
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
	id: "rule-004",
	category: "testing",
	originalName: "effect-vitest-imports",
	rule: "Never import from vitest directly; use @effect/vitest",
	example: "Test file imports",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never import from vitest directly; use @effect/vitest
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-vitest-imports
		// Checks for: from "vitest", describe, it, expect

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
