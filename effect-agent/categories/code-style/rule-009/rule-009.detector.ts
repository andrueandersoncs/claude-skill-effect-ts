/**
 * rule-009: fix-types
 *
 * Rule: Never suppress type errors with comments; fix the types
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
	id: "rule-009",
	category: "code-style",
	originalName: "fix-types",
	rule: "Never suppress type errors with comments; fix the types",
	example: "Type mismatch error",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never suppress type errors with comments; fix the types
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for fix-types
		// Checks for: @ts-expect-error, @ts-expect-error

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
