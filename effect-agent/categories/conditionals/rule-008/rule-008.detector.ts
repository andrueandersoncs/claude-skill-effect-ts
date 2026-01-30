/**
 * rule-008: result-effect-match
 *
 * Rule: Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass
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
	id: "rule-008",
	category: "conditionals",
	originalName: "result-effect-match",
	rule: "Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass",
	example: "Effect success/failure handling with Schema-defined result types",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for result-effect-match
		// Checks for: success/error flag checks, isError property

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "potential",
	detect,
};

export default detector;
