/**
 * rule-013: safe-property-access
 *
 * Rule: Never use record[key]; use Record.get (returns Option)
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
	id: "rule-013",
	category: "native-apis",
	originalName: "safe-property-access",
	rule: "Never use record[key]; use Record.get (returns Option)",
	example: "Safe property access",
} as const;

const violation = createViolationHelper(meta, "info", "potential");

/**
 * Detect violations of: Never use record[key]; use Record.get (returns Option)
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for safe-property-access
		// Checks for: record[key]

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
