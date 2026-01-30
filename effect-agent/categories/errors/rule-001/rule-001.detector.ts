/**
 * rule-001: all-either-mode
 *
 * Rule: Never use fail-fast Promise.all; use Effect.all with mode: "either"
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
	id: "rule-001",
	category: "errors",
	originalName: "all-either-mode",
	rule: 'Never use fail-fast Promise.all; use Effect.all with mode: "either"',
	example: "Get Either results for each operation",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use fail-fast Promise.all; use Effect.all with mode: "either"
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for all-either-mode
		// Checks for: Promise.all without error handling

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
