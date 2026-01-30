/**
 * rule-007: map-error
 *
 * Rule: Never rethrow transformed errors; use Effect.mapError
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
	id: "rule-007",
	category: "errors",
	originalName: "map-error",
	rule: "Never rethrow transformed errors; use Effect.mapError",
	example: "Transform low-level to domain errors",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never rethrow transformed errors; use Effect.mapError
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for map-error
		// Checks for: catch with throw new Error

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
