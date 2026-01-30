/**
 * rule-006: finding-with-default
 *
 * Rule: Never use array.find(); use Array.findFirst (returns Option)
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
	id: "rule-006",
	category: "native-apis",
	originalName: "finding-with-default",
	rule: "Never use array.find(); use Array.findFirst (returns Option)",
	example: "Finding with default",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use array.find(); use Array.findFirst (returns Option)
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for finding-with-default
		// Checks for: .find()

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
