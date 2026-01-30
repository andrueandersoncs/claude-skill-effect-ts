/**
 * rule-002: context-tag-filesystem
 *
 * Rule: Never use direct file I/O; use a Context.Tag service
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
	id: "rule-002",
	category: "services",
	originalName: "context-tag-filesystem",
	rule: "Never use direct file I/O; use a Context.Tag service",
	example: "File system operations",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never use direct file I/O; use a Context.Tag service
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for context-tag-filesystem
		// Checks for: fs., readFile, writeFile, readdir

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
