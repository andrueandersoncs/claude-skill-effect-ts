/**
 * rule-001: arbitrary-responses
 *
 * Rule: Never stub methods as "not implemented"; use Arbitrary-generated responses
 * Category: testing
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
	category: "testing",
	originalName: "arbitrary-responses",
	rule: 'Never stub methods as "not implemented"; use Arbitrary-generated responses',
	example: "Anti-pattern: stubbing methods as not implemented",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never stub methods as "not implemented"; use Arbitrary-generated responses
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for arbitrary-responses
		// Checks for: "not implemented", throw in stub

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
