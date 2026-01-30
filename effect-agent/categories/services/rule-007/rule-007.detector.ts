/**
 * rule-007: stateful-test-layer
 *
 * Rule: Never use stateless test mocks; use Layer.effect with Ref for state
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
	id: "rule-007",
	category: "services",
	originalName: "stateful-test-layer",
	rule: "Never use stateless test mocks; use Layer.effect with Ref for state",
	example: "Repository test layer maintaining state",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use stateless test mocks; use Layer.effect with Ref for state
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for stateful-test-layer
		// Checks for: stateless test mock

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
