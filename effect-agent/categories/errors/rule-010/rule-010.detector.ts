/**
 * rule-010: sandbox-catch-tags
 *
 * Rule: Never use try/catch for Effect errors; use Effect.sandbox with catchTags
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
	id: "rule-010",
	category: "errors",
	originalName: "sandbox-catch-tags",
	rule: "Never use try/catch for Effect errors; use Effect.sandbox with catchTags",
	example: "Handling defects and expected errors",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use try/catch for Effect errors; use Effect.sandbox with catchTags
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for sandbox-catch-tags
		// Checks for: catching defects

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "info",
	defaultCertainty: "potential",
	detect,
};

export default detector;
