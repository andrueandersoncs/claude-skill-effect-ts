/**
 * rule-002: arbitrary-test-layer
 *
 * Rule: Never hard-code values in test layers; use Arbitrary-generated values
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
	id: "rule-002",
	category: "testing",
	originalName: "arbitrary-test-layer",
	rule: "Never hard-code values in test layers; use Arbitrary-generated values",
	example: "Test layer with hard-coded responses",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never hard-code values in test layers; use Arbitrary-generated values
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for arbitrary-test-layer
		// Checks for: hard-coded test values

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
