/**
 * rule-009: head-and-tail-access
 *
 * Rule: Never use array[index]; use Array.get or Array.head/last (returns Option)
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
	id: "rule-009",
	category: "native-apis",
	originalName: "head-and-tail-access",
	rule: "Never use array[index]; use Array.get or Array.head/last (returns Option)",
	example: "Head and tail access",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use array[index]; use Array.get or Array.head/last (returns Option)
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for head-and-tail-access
		// Checks for: array[0], array[array.length - 1]

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
