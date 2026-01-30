/**
 * rule-001: array-splice-modification
 *
 * Rule: Never mutate variables (let, push, pop, splice); use immutable operations
 * Category: imperative
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "imperative",
	originalName: "array-splice-modification",
	rule: "Never mutate variables (let, push, pop, splice); use immutable operations",
	example: "Array splice/modification",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never mutate variables (let, push, pop, splice); use immutable operations
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for array-splice-modification
		// Checks for: push, pop, shift, unshift, splice, sort, reverse

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "potential",
	detect,
};

export default detector;
