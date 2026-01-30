/**
 * rule-010: it-scoped
 *
 * Rule: Never manage resources manually in tests; use it.scoped
 * Category: testing
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
	category: "testing",
	originalName: "it-scoped",
	rule: "Never manage resources manually in tests; use it.scoped",
	example: "Testing with acquireRelease resources",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never manage resources manually in tests; use it.scoped
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for it-scoped
		// Checks for: manual resource cleanup in test

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
