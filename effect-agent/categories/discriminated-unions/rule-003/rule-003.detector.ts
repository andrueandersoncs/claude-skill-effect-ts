/**
 * rule-003: runtime-validation
 *
 * Rule: Never cast unknown to check ._tag; use Schema.is() for validation
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
	id: "rule-003",
	category: "discriminated-unions",
	originalName: "runtime-validation",
	rule: "Never cast unknown to check ._tag; use Schema.is() for validation",
	example: "Runtime validation of unknown input",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never cast unknown to check ._tag; use Schema.is() for validation
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for runtime-validation
		// Checks for: (x as unknown)._tag

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
