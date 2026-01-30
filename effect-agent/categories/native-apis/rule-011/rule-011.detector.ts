/**
 * rule-011: removing-duplicates
 *
 * Rule: Never use [...new Set()]; use Array.dedupe
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
	id: "rule-011",
	category: "native-apis",
	originalName: "removing-duplicates",
	rule: "Never use [...new Set()]; use Array.dedupe",
	example: "Removing duplicates",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use [...new Set()]; use Array.dedupe
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for removing-duplicates
		// Checks for: [...new Set()], Array.from(new Set())

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
