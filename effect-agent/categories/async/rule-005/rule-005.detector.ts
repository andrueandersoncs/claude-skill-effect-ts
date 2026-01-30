/**
 * rule-005: promise-chain
 *
 * Rule: Never use Promise chains (.then); use pipe with Effect.map/flatMap
 * Category: async
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
	category: "async",
	originalName: "promise-chain",
	rule: "Never use Promise chains (.then); use pipe with Effect.map/flatMap",
	example: "Promise chain with transformation",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use Promise chains (.then); use pipe with Effect.map/flatMap
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for promise-chain
		// Checks for: async/await, .then(), .catch(), Promise.resolve/reject

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
