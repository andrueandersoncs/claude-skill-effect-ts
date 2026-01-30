/**
 * rule-005: equality-testers
 *
 * Rule: Never skip addEqualityTesters(); call it for Effect type equality
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
	id: "rule-005",
	category: "testing",
	originalName: "equality-testers",
	rule: "Never skip addEqualityTesters(); call it for Effect type equality",
	example: "Setup for Effect equality assertions",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never skip addEqualityTesters(); call it for Effect type equality
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for equality-testers
		// Checks for: beforeAll without addEqualityTesters

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
