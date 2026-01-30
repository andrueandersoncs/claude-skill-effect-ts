/**
 * rule-002: code-organization
 *
 * Rule: Never add section marker comments; use file organization and clear naming instead
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
	id: "rule-002",
	category: "comments",
	originalName: "code-organization",
	rule: "Never add section marker comments; use file organization and clear naming instead",
	example: "Code organization",
} as const;

const violation = createViolationHelper(meta, "info", "definite");

/**
 * Detect violations of: Never add section marker comments; use file organization and clear naming instead
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for code-organization
		// Checks for: // ===, // ---, // ###

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "info",
	defaultCertainty: "definite",
	detect,
};

export default detector;
