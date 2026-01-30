/**
 * rule-015: tuple-transformation
 *
 * Rule: Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond
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
	id: "rule-015",
	category: "native-apis",
	originalName: "tuple-transformation",
	rule: "Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond",
	example: "Tuple transformation",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for tuple-transformation
		// Checks for: tuple[0], tuple[1]

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
