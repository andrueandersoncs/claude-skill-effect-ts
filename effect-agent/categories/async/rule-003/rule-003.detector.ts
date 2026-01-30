/**
 * rule-003: http-handler-boundary
 *
 * Rule: Never use Effect.runPromise except at application boundaries
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
	id: "rule-003",
	category: "async",
	originalName: "http-handler-boundary",
	rule: "Never use Effect.runPromise except at application boundaries",
	example: "HTTP handler (boundary OK)",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use Effect.runPromise except at application boundaries
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for http-handler-boundary
		// Checks for: Effect.runPromise outside boundaries

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "potential",
	detect,
};

export default detector;
