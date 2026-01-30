/**
 * rule-008: grouping-items-by-key
 *
 * Rule: Never manually group with loops; use Array.groupBy
 * Category: native-apis
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
	category: "native-apis",
	originalName: "grouping-items-by-key",
	rule: "Never manually group with loops; use Array.groupBy",
	example: "Grouping items by key",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never manually group with loops; use Array.groupBy
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for grouping-items-by-key
		// Checks for: reduce to group

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
