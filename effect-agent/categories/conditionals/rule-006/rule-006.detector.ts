/**
 * rule-006: nullable-option-match
 *
 * Rule: Never use null checks (if x != null); use Option.match
 * Category: conditionals
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
	category: "conditionals",
	originalName: "nullable-option-match",
	rule: "Never use null checks (if x != null); use Option.match",
	example: "Effectful handling of nullable",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use null checks (if x != null); use Option.match
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for nullable-option-match
		// Checks for: != null, !== null, != undefined, !== undefined

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
