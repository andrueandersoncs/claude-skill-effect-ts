/**
 * rule-014: validate-api-response
 *
 * Rule: Never use type casting (as); use Schema.decodeUnknown or type guards
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
	id: "rule-014",
	category: "code-style",
	originalName: "validate-api-response",
	rule: "Never use type casting (as); use Schema.decodeUnknown or type guards",
	example: "Validating API response",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use type casting (as); use Schema.decodeUnknown or type guards
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for validate-api-response
		// Checks for: as Type

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
