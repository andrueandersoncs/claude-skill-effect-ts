/**
 * rule-013: unused-variable
 *
 * Rule: Never use eslint-disable comments; fix the underlying issue
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
	id: "rule-013",
	category: "code-style",
	originalName: "unused-variable",
	rule: "Never use eslint-disable comments; fix the underlying issue",
	example: "Unused variable warning",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use eslint-disable comments; fix the underlying issue
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for unused-variable
		// Checks for: eslint-disable no-unused-vars

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
