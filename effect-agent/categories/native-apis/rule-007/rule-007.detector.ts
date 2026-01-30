/**
 * rule-007: function-constant-value
 *
 * Rule: Never use () => value; use Function.constant
 * Category: native-apis
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
	category: "native-apis",
	originalName: "function-constant-value",
	rule: "Never use () => value; use Function.constant",
	example: "Function that always returns same value",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use () => value; use Function.constant
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for function-constant-value
		// Checks for: () => constant

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
