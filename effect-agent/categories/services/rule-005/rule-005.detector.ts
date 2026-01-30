/**
 * rule-005: layer-effect
 *
 * Rule: Never create services inline; use Layer.effect or Layer.succeed
 * Category: services
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "services",
	originalName: "layer-effect",
	rule: "Never create services inline; use Layer.effect or Layer.succeed",
	example: "Service with dependencies",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never create services inline; use Layer.effect or Layer.succeed
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for layer-effect
		// Checks for: inline service creation

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
