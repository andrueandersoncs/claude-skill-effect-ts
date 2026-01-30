/**
 * rule-004: schema-class-methods
 *
 * Rule: Never use Schema.Struct for entities with methods; use Schema.Class
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
	id: "rule-004",
	category: "schema",
	originalName: "schema-class-methods",
	rule: "Never use Schema.Struct for entities with methods; use Schema.Class",
	example: "Entity with computed properties",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use Schema.Struct for entities with methods; use Schema.Class
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-class-methods
		// Checks for: Schema.Struct for entities with methods

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
