/**
 * rule-011: timeout-fail
 *
 * Rule: Never use setTimeout for timeouts; use Effect.timeout
 * Category: errors
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "errors",
	originalName: "timeout-fail",
	rule: "Never use setTimeout for timeouts; use Effect.timeout",
	example: "Timeout with typed error",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use setTimeout for timeouts; use Effect.timeout
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for timeout-fail
		// Checks for: setTimeout for timeout

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
