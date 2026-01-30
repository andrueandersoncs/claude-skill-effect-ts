/**
 * rule-001: context-tag-api
 *
 * Rule: Never call external APIs directly; use a Context.Tag service
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
	id: "rule-001",
	category: "services",
	originalName: "context-tag-api",
	rule: "Never call external APIs directly; use a Context.Tag service",
	example: "HTTP API call",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never call external APIs directly; use a Context.Tag service
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for context-tag-api
		// Checks for: fetch(, axios., got., request(

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "potential",
	detect,
};

export default detector;
