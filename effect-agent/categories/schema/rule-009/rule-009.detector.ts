/**
 * rule-009: schema-tagged-error
 *
 * Rule: Never use Data.TaggedError; use Schema.TaggedError
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
	id: "rule-009",
	category: "schema",
	originalName: "schema-tagged-error",
	rule: "Never use Data.TaggedError; use Schema.TaggedError",
	example: "Error type definition",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use Data.TaggedError; use Schema.TaggedError
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
