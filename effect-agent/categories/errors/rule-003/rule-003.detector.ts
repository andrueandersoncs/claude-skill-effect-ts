/**
 * rule-003: catch-tags
 *
 * Rule: Never use switch on error._tag; use Effect.catchTags
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
	id: "rule-003",
	category: "errors",
	originalName: "catch-tags",
	rule: "Never use switch on error._tag; use Effect.catchTags",
	example: "Handling multiple error types",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use switch on error._tag; use Effect.catchTags
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for catch-tags
		// Checks for: switch on error._tag

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
