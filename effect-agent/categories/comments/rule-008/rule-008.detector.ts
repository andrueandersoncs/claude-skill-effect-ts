/**
 * rule-008: todo-comments
 *
 * Rule: Never add TODO comments without actionable context; either fix it or remove it
 * Category: comments
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
	category: "comments",
	originalName: "todo-comments",
	rule: "Never add TODO comments without actionable context; either fix it or remove it",
	example: "TODO comments",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never add TODO comments without actionable context; either fix it or remove it
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for todo-comments
		// Checks for: // TODO, // FIXME, // HACK

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
