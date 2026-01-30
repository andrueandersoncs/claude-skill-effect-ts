/**
 * rule-004: data-transformation-pipeline
 *
 * Rule: Never use native method chaining; use pipe with Effect's Array module
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
	id: "rule-004",
	category: "native-apis",
	originalName: "data-transformation-pipeline",
	rule: "Never use native method chaining; use pipe with Effect's Array module",
	example: "Data transformation pipeline",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use native method chaining; use pipe with Effect's Array module
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for data-transformation-pipeline
		// Checks for: .map().filter().reduce()

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
