/**
 * rule-008: wrap-external-async
 *
 * Rule: Never use async functions; use Effect.gen with yield*
 * Category: async
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "async",
	originalName: "wrap-external-async",
	rule: "Never use async functions; use Effect.gen with yield*",
	example: "Wrapping external async library",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use async functions; use Effect.gen with yield*
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for wrap-external-async
		// Checks for: async functions

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
