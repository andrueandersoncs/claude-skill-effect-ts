/**
 * rule-006: effect-gen-multi-step
 *
 * Rule: Use Effect.gen() for multi-step sequential operations
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
	id: "rule-006",
	category: "code-style",
	originalName: "effect-gen-multi-step",
	rule: "Use Effect.gen() for multi-step sequential operations",
	example: "Multiple dependent operations",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Use Effect.gen() for multi-step sequential operations
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for effect-gen-multi-step
		// Checks for: multiple sequential operations

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
