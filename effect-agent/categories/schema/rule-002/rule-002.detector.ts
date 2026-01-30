/**
 * rule-002: no-plain-error
 *
 * Rule: Never extend plain Error class; use Schema.TaggedError
 * Category: schema
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "schema",
	originalName: "no-plain-error",
	rule: "Never extend plain Error class; use Schema.TaggedError",
	example: "Domain error types",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never extend plain Error class; use Schema.TaggedError
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for no-plain-error
		// Checks for: extends Error

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
