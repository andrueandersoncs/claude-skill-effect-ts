/**
 * rule-005: schema-class
 *
 * Rule: Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass
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
	id: "rule-005",
	category: "schema",
	originalName: "schema-class",
	rule: "Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass",
	example: "Data structure definition",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-class
		// Checks for: interface, type = { ... }

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
