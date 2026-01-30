/**
 * rule-011: layer-effect-prop
 *
 * Rule: Never test with partial coverage; combine layer() with it.effect.prop
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
	id: "rule-011",
	category: "testing",
	originalName: "layer-effect-prop",
	rule: "Never test with partial coverage; combine layer() with it.effect.prop",
	example: "Full property-based integration test",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never test with partial coverage; combine layer() with it.effect.prop
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for layer-effect-prop
		// Checks for: partial test coverage

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
