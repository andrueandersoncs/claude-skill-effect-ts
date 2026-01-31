/**
 * rule-005: effect-fn-transformation
 *
 * Rule: Never write plain functions; use Effect.fn() or Effect.gen()
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "code-style",
	name: "effect-fn-transformation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Helper to check if a function body is a pure transformation
	const checkPureFunction = (
		funcName: string,
		body: ts.Node,
		startNode: ts.Node,
	) => {
		const bodyText = body.getText(sourceFile);

		// Check if it's a pure transformation (no side effects indicators)
		const hasSideEffects =
			bodyText.includes("console.") ||
			bodyText.includes("throw") ||
			bodyText.includes("await") ||
			bodyText.includes("fetch") ||
			bodyText.includes(".mutate") ||
			bodyText.includes(".push") ||
			bodyText.includes(".pop");

		// Skip if it's already creating an Effect
		if (bodyText.includes("Effect.") || bodyText.includes("yield*")) {
			return;
		}

		if (!hasSideEffects) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				startNode.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Plain function '${funcName}'; consider Effect.fn() for traceability`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: startNode.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "potential",
				suggestion:
					"Use Effect.fn('functionName')((...args) => result) for traced pure transformations",
			});
		}
	};

	const visit = (node: ts.Node) => {
		// Detect plain function declarations that could be Effect.fn
		if (ts.isFunctionDeclaration(node) && node.name && node.body) {
			checkPureFunction(node.name.text, node.body, node);
		}

		// Detect arrow functions assigned to variables (const foo = () => ...)
		if (
			ts.isVariableDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name) &&
			node.initializer &&
			ts.isArrowFunction(node.initializer)
		) {
			const arrowFunc = node.initializer;
			checkPureFunction(node.name.text, arrowFunc.body, node);
		}

		// Detect function expressions assigned to variables (const foo = function() {})
		if (
			ts.isVariableDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name) &&
			node.initializer &&
			ts.isFunctionExpression(node.initializer)
		) {
			const funcExpr = node.initializer;
			if (funcExpr.body) {
				checkPureFunction(node.name.text, funcExpr.body, node);
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
