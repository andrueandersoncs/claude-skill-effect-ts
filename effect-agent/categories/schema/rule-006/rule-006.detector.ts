/**
 * rule-006: schema-constructor
 *
 * Rule: Never construct object literals; use Schema class constructors
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
	id: "rule-006",
	category: "schema",
	originalName: "schema-constructor",
	rule: "Never construct object literals; use Schema class constructors",
	example: "Creating data instances",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never construct object literals; use Schema class constructors
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-constructor
		// Checks for: object literal construction

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
