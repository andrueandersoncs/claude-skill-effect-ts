/**
 * rule-001: composing-two-functions
 *
 * Rule: Never nest two function calls; use Function.compose
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
	id: "rule-001",
	category: "native-apis",
	originalName: "composing-two-functions",
	rule: "Never nest two function calls; use Function.compose",
	example: "Composing two functions",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never nest two function calls; use Function.compose
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for composing-two-functions
		// Checks for: f(g(x))

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
