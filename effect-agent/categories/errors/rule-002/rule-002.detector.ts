/**
 * rule-002: catch-tag
 *
 * Rule: Never check error._tag manually; use Effect.catchTag
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
	id: "rule-002",
	category: "errors",
	originalName: "catch-tag",
	rule: "Never check error._tag manually; use Effect.catchTag",
	example: "Recovering from specific errors",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never check error._tag manually; use Effect.catchTag
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for catch-tag
		// Checks for: error._tag === 'X'

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
