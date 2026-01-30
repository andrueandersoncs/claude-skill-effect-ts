/**
 * rule-007: exhaustive-match
 *
 * Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
 * Category: code-style
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "code-style",
	originalName: "exhaustive-match",
	rule: "Never use eslint-disable for exhaustive checks; use Match.exhaustive",
	example: "Switch exhaustiveness",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use eslint-disable for exhaustive checks; use Match.exhaustive
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for exhaustive-match
		// Checks for: eslint-disable switch exhaustive

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
