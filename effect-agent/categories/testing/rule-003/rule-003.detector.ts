/**
 * rule-003: effect-exit
 *
 * Rule: Never use try/catch for error assertions; use Effect.exit
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
	id: "rule-003",
	category: "testing",
	originalName: "effect-exit",
	rule: "Never use try/catch for error assertions; use Effect.exit",
	example: "Asserting on error type and data",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use try/catch for error assertions; use Effect.exit
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-exit
		// Checks for: try/catch for error assertions

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
