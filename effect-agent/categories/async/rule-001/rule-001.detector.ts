/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "async",
	name: "callback-api",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect new Promise()
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Promise"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "new Promise() should be replaced with Effect.async()",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion: "Use Effect.async() for callback-based APIs",
			});
		}

		// Detect callback patterns (functions with callback parameter names)
		if (
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isArrowFunction(node)) &&
			node.parameters.length > 0
		) {
			const lastParam = node.parameters[node.parameters.length - 1];
			const paramName = lastParam.name.getText(sourceFile).toLowerCase();
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
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Callback-style APIs should be wrapped with Effect.async()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "info",
					certainty: "potential",
					suggestion: "Wrap callback-based APIs with Effect.async()",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
