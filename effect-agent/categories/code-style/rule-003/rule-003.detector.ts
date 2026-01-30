/**
 * rule-003: dynamic-property-access
 *
 * Rule: Never use eslint-disable for any-type errors; use Schema
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
	id: "rule-003",
	category: "code-style",
	originalName: "dynamic-property-access",
	rule: "Never use eslint-disable for any-type errors; use Schema",
	example: "Dynamic property access",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use eslint-disable for any-type errors; use Schema
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for dynamic-property-access
		// Checks for: eslint-disable @typescript-eslint/no-explicit-any

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
