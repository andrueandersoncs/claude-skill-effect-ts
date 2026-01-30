/**
 * rule-006: it-effect-prop
 *
 * Rule: Never use hard-coded test data; use it.effect.prop with Schema
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
	id: "rule-006",
	category: "testing",
	originalName: "it-effect-prop",
	rule: "Never use hard-coded test data; use it.effect.prop with Schema",
	example: "Multiple test inputs",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use hard-coded test data; use it.effect.prop with Schema
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for it-effect-prop
		// Checks for: hard-coded test data

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
