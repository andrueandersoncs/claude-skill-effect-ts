/**
 * rule-001: branded-type-definition
 *
 * Rule: Never add JSDoc comments that merely restate the type definition; the types are self-documenting
 * Category: comments
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "comments",
	originalName: "branded-type-definition",
	rule: "Never add JSDoc comments that merely restate the type definition; the types are self-documenting",
	example: "Branded type definition",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never add JSDoc comments that merely restate the type definition; the types are self-documenting
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for branded-type-definition
		// Checks for: JSDoc restating type

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
