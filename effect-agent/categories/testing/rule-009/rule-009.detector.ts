/**
 * rule-009: it-prop-schema
 *
 * Rule: Never use raw fc.integer/fc.string; use it.prop with Schema
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
	id: "rule-009",
	category: "testing",
	originalName: "it-prop-schema",
	rule: "Never use raw fc.integer/fc.string; use it.prop with Schema",
	example: "Converting raw fast-check to Schema-based",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use raw fc.integer/fc.string; use it.prop with Schema
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for it-prop-schema
		// Checks for: fc.integer, fc.string, raw fast-check

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "definite",
	detect,
};

export default detector;
