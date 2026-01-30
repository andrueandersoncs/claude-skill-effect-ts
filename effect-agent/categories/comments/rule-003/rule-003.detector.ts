/**
 * rule-003: effect-pipeline
 *
 * Rule: Never add inline comments for obvious Effect patterns; Effect code is self-documenting
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
	id: "rule-003",
	category: "comments",
	originalName: "effect-pipeline",
	rule: "Never add inline comments for obvious Effect patterns; Effect code is self-documenting",
	example: "Effect pipeline",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never add inline comments for obvious Effect patterns; Effect code is self-documenting
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-pipeline
		// Checks for: // get, // map, // filter

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
