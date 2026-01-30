/**
 * rule-005: filter-and-transform-single-pass
 *
 * Rule: Never chain filter then map; use Array.filterMap in one pass
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
	id: "rule-005",
	category: "native-apis",
	originalName: "filter-and-transform-single-pass",
	rule: "Never chain filter then map; use Array.filterMap in one pass",
	example: "Filter and transform in single pass",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never chain filter then map; use Array.filterMap in one pass
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for filter-and-transform-single-pass
		// Checks for: .filter().map()

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
