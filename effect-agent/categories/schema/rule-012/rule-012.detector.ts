/**
 * rule-012: schema-unknown-legitimate
 *
 * Rule: Never use Schema.Any/Schema.Unknown unless genuinely unconstrained
 * Category: schema
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "schema",
	originalName: "schema-unknown-legitimate",
	rule: "Never use Schema.Any/Schema.Unknown unless genuinely unconstrained",
	example: "Legitimate use of Schema.Unknown (exception cause)",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use Schema.Any/Schema.Unknown unless genuinely unconstrained
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for schema-unknown-legitimate
		// Checks for: Schema.Any, Schema.Unknown

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
