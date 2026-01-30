/**
 * rule-006: race-operations
 *
 * Rule: Never use Promise.race; use Effect.race or Effect.raceAll
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
	id: "rule-006",
	category: "async",
	originalName: "race-operations",
	rule: "Never use Promise.race; use Effect.race or Effect.raceAll",
	example: "Racing multiple operations",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use Promise.race; use Effect.race or Effect.raceAll
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for race-operations
		// Checks for: Promise.race, Promise.any

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
