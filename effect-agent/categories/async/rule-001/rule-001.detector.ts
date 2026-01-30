/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
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
	id: "rule-001",
	category: "async",
	originalName: "callback-api",
	rule: "Never use new Promise(); use Effect.async for callback-based APIs",
	example: "Converting callback-based API",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use new Promise(); use Effect.async for callback-based APIs
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect new Promise()
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Promise"
		) {
			violations.push(
				violation(
					context,
					node,
					"new Promise() should be replaced with Effect.async()",
					"Use Effect.async() for callback-based APIs",
				),
			);
		}

		// Detect callback patterns (functions with callback parameter names)
		if (
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isArrowFunction(node)) &&
			node.parameters.length > 0
		) {
			const lastParam = node.parameters[node.parameters.length - 1];
			const paramName = lastParam.name
				.getText(context.sourceFile)
				.toLowerCase();
			const callbackNames = [
				"callback",
				"cb",
				"done",
				"next",
				"resolve",
				"reject",
				"handler",
			];

			if (callbackNames.some((name) => paramName.includes(name))) {
				violations.push(
					violation(
						context,
						node,
						"Callback-style APIs should be wrapped with Effect.async()",
						"Wrap callback-based APIs with Effect.async()",
						{ severity: "info", certainty: "potential" },
					),
				);
			}
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
