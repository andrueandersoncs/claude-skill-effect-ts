/**
 * rule-008: fat-arrow-syntax
 *
 * Rule: Never use the function keyword; use fat arrow syntax
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
	id: "rule-008",
	category: "code-style",
	originalName: "fat-arrow-syntax",
	rule: "Never use the function keyword; use fat arrow syntax",
	example: "Function declarations",
} as const;

const violation = createViolationHelper(meta, "warning", "definite");

/**
 * Detect violations of: Never use the function keyword; use fat arrow syntax
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect function declarations
		if (ts.isFunctionDeclaration(node)) {
			violations.push(
				violation(
					context,
					node,
					"function declarations should use arrow function syntax",
					"Convert to const myFunc = () => { ... }",
				),
			);
		}

		// Detect function expressions (not arrow functions)
		if (ts.isFunctionExpression(node)) {
			violations.push(
				violation(
					context,
					node,
					"function expressions should use arrow function syntax",
					"Convert to arrow function syntax: () => { ... }",
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
	defaultSeverity: "warning",
	defaultCertainty: "definite",
	detect,
};

export default detector;
