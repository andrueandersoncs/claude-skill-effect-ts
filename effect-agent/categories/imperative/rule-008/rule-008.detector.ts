/**
 * rule-008: recursive-effect-processing
 *
 * Rule: Never use imperative loops for tree traversal; use recursion with Effect
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
	id: "rule-008",
	category: "imperative",
	originalName: "recursive-effect-processing",
	rule: "Never use imperative loops for tree traversal; use recursion with Effect",
	example: "Recursive Effect processing",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use imperative loops for tree traversal; use recursion with Effect
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for recursive-effect-processing
		// Checks for: recursive functions without Effect

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
