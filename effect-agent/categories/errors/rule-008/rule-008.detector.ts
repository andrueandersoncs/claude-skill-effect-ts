/**
 * rule-008: or-else-fallback
 *
 * Rule: Never use catchAll for fallbacks; use Effect.orElse
 * Category: errors
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "errors",
	originalName: "or-else-fallback",
	rule: "Never use catchAll for fallbacks; use Effect.orElse",
	example: "Fallback to alternative",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use catchAll for fallbacks; use Effect.orElse
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for or-else-fallback
		// Checks for: catchAll for simple fallback

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
