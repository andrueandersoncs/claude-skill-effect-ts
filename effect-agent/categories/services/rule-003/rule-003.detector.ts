/**
 * rule-003: context-tag-repository
 *
 * Rule: Never access database directly; use a Context.Tag repository
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
	id: "rule-003",
	category: "services",
	originalName: "context-tag-repository",
	rule: "Never access database directly; use a Context.Tag repository",
	example: "Database operations",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never access database directly; use a Context.Tag repository
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for context-tag-repository
		// Checks for: .query(, prisma., mongoose., sql`

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
