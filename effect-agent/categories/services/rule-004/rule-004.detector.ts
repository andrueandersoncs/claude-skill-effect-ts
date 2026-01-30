/**
 * rule-004: layer-composition
 *
 * Rule: Never provide services ad-hoc; compose layers with Layer.mergeAll/provide
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
	id: "rule-004",
	category: "services",
	originalName: "layer-composition",
	rule: "Never provide services ad-hoc; compose layers with Layer.mergeAll/provide",
	example: "Building application layer stack",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never provide services ad-hoc; compose layers with Layer.mergeAll/provide
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for layer-composition
		// Checks for: Effect.provideService chain

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
