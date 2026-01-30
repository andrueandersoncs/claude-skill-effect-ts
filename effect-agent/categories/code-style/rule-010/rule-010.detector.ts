/**
 * rule-010: non-null-assertion
 *
 * Rule: Never use ! (non-null assertion); use Option or Effect
 * Category: code-style
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "code-style",
	originalName: "non-null-assertion",
	rule: "Never use ! (non-null assertion); use Option or Effect",
	example: "Asserting non-null value",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use ! (non-null assertion); use Option or Effect
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect non-null assertion expressions (!)
		if (ts.isNonNullExpression(node)) {
			violations.push(
				violation(
					context,
					node,
					"Non-null assertion (!) should be replaced with Option or Effect",
					"Use Option.fromNullable() and handle the None case explicitly",
				),
			);
		}

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
