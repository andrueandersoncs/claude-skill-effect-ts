/**
 * rule-007: repeated-execution
 *
 * Rule: Never use setTimeout/setInterval; use Effect.sleep and Schedule
 * Category: async
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
	category: "async",
	originalName: "repeated-execution",
	rule: "Never use setTimeout/setInterval; use Effect.sleep and Schedule",
	example: "Repeated execution",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use setTimeout/setInterval; use Effect.sleep and Schedule
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for repeated-execution
		// Checks for: setTimeout, setInterval

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
