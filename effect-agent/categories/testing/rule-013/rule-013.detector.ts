/**
 * rule-013: property-based
 *
 * Rule: Never write manual property tests; use it.effect.prop
 * Category: testing
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "testing",
	originalName: "property-based",
	rule: "Never write manual property tests; use it.effect.prop",
	example: "Property test with Effect",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never write manual property tests; use it.effect.prop
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for property-based
		// Checks for: manual property tests

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
