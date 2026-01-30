/**
 * rule-015: test-clock
 *
 * Rule: Never provide TestClock.layer manually; it.effect includes it automatically
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
	id: "rule-015",
	category: "testing",
	originalName: "test-clock",
	rule: "Never provide TestClock.layer manually; it.effect includes it automatically",
	example: "Time-based testing",
} as const;

const violation = createViolationHelper(meta, "info", "definite");

/**
 * Detect violations of: Never provide TestClock.layer manually; it.effect includes it automatically
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for test-clock
		// Checks for: TestClock.layer

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "info",
	defaultCertainty: "definite",
	detect,
};

export default detector;
