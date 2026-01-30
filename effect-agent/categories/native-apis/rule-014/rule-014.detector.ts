/**
 * rule-014: struct-predicate
 *
 * Rule: Never use manual &&/|| for predicates; use Predicate.and/or/not
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
	id: "rule-014",
	category: "native-apis",
	originalName: "struct-predicate",
	rule: "Never use manual &&/|| for predicates; use Predicate.and/or/not",
	example: "Struct predicate",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use manual &&/|| for predicates; use Predicate.and/or/not
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for struct-predicate
		// Checks for: && || predicates

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
