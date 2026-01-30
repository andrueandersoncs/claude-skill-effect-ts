/**
 * rule-007: use-union-directly
 *
 * Rule: Never extract types from ._tag; use the union type directly
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
	id: "rule-007",
	category: "discriminated-unions",
	originalName: "use-union-directly",
	rule: "Never extract types from ._tag; use the union type directly",
	example: "Extracting _tag as a type",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never extract types from ._tag; use the union type directly
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for use-union-directly
		// Checks for: type Tag = x['_tag']

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
