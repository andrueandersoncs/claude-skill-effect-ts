/**
 * rule-002: partitioning-by-tag
 *
 * Rule: Never use ._tag in array predicates; use Schema.is(Variant)
 * Category: discriminated-unions
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "discriminated-unions",
	originalName: "partitioning-by-tag",
	rule: "Never use ._tag in array predicates; use Schema.is(Variant)",
	example: "Partitioning by _tag",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use ._tag in array predicates; use Schema.is(Variant)
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for partitioning-by-tag
		// Checks for: .filter(x => x._tag ===

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
