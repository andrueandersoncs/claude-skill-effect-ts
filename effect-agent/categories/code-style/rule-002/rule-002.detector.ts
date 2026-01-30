/**
 * rule-002: dynamic-data
 *
 * Rule: Never use 'as any'; fix the type or create a Schema
 * Category: code-style
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
	category: "code-style",
	originalName: "dynamic-data",
	rule: "Never use 'as any'; fix the type or create a Schema",
	example: "Working with dynamic data",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use 'as any'; fix the type or create a Schema
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for dynamic-data
		// Checks for: as any

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "definite",
	detect,
};

export default detector;
