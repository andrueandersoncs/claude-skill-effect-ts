/**
 * rule-012: reusable-pipeline
 *
 * Rule: Never use nested function calls; use flow for composing pipelines
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
	id: "rule-012",
	category: "native-apis",
	originalName: "reusable-pipeline",
	rule: "Never use nested function calls; use flow for composing pipelines",
	example: "Building reusable transformation pipeline",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use nested function calls; use flow for composing pipelines
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for reusable-pipeline
		// Checks for: nested function calls

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
