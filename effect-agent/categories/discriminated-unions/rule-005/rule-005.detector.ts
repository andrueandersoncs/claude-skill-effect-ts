/**
 * rule-005: schema-tagged-error
 *
 * Rule: Never use Data.TaggedError; use Schema.TaggedError for full compatibility
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
	id: "rule-005",
	category: "discriminated-unions",
	originalName: "schema-tagged-error",
	rule: "Never use Data.TaggedError; use Schema.TaggedError for full compatibility",
	example: "Error handling with Schema.TaggedError",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use Data.TaggedError; use Schema.TaggedError for full compatibility
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-tagged-error
		// Checks for: Data.TaggedError

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "definite",
	detect,
};

export default detector;
