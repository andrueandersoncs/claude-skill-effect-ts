/**
 * rule-012: typed-errors
 *
 * Rule: Never use untyped errors; use Schema.TaggedError
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
	id: "rule-012",
	category: "errors",
	originalName: "typed-errors",
	rule: "Never use untyped errors; use Schema.TaggedError",
	example: "Multiple error types",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use untyped errors; use Schema.TaggedError
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for typed-errors
		// Checks for: throw, new Error(), extends Error, console.error

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
