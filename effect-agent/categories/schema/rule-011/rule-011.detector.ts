/**
 * rule-011: schema-union
 *
 * Rule: Never use TypeScript union types; use Schema.Union of TaggedClass
 * Category: schema
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "schema",
	originalName: "schema-union",
	rule: "Never use TypeScript union types; use Schema.Union of TaggedClass",
	example: "Union type definition",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use TypeScript union types; use Schema.Union of TaggedClass
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-union
		// Checks for: TypeScript union types

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
