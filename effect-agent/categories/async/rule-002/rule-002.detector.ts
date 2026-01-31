/**
 * rule-002: generator-yield
 *
 * Rule: Never use yield or await in Effect.gen; use yield*
 *
 * Detects:
 * - yield (without *) expressions inside Effect.gen callbacks
 * - await expressions inside Effect.gen callbacks
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "async",
	name: "generator-yield",
};

/**
 * Check if a node is an Effect.gen call expression
 */
const isEffectGenCall = (node: ts.Node): node is ts.CallExpression => {
	if (!ts.isCallExpression(node)) return false;

	const expr = node.expression;
	if (!ts.isPropertyAccessExpression(expr)) return false;

	const obj = expr.expression;
	const prop = expr.name;

	return ts.isIdentifier(obj) && obj.text === "Effect" && prop.text === "gen";
};

/**
 * Find the generator function callback inside Effect.gen(...)
 */
const findGenCallback = (
	callExpr: ts.CallExpression,
): ts.FunctionExpression | undefined => {
	// Effect.gen takes a generator function as its argument
	// Can be Effect.gen(function* () { ... }) or Effect.gen(this, function* () { ... })
	for (const arg of callExpr.arguments) {
		if (ts.isFunctionExpression(arg) && arg.asteriskToken) {
			return arg;
		}
	}
	return undefined;
};

/**
 * Check if a yield expression is missing the * (delegate)
 * yield* expr -> has asteriskToken
 * yield expr -> no asteriskToken
 */
const isYieldWithoutStar = (node: ts.Node): node is ts.YieldExpression => {
	return ts.isYieldExpression(node) && !node.asteriskToken;
};

/**
 * Check if a node is an await expression
 */
const isAwaitExpression = (node: ts.Node): node is ts.AwaitExpression => {
	return ts.isAwaitExpression(node);
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Look for Effect.gen calls
		if (isEffectGenCall(node)) {
			const genCallback = findGenCallback(node);
			if (genCallback && genCallback.body) {
				// Search within the generator body for yield without * or await
				const visitGenBody = (innerNode: ts.Node) => {
					// Check for yield without *
					if (isYieldWithoutStar(innerNode)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(innerNode.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Use yield* instead of yield in Effect.gen - yield without * returns the Effect itself, not its result",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: innerNode
								.getText(sourceFile)
								.slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion:
								"Change 'yield effect' to 'yield* effect' to unwrap the Effect and get its value",
						});
					}

					// Check for await expressions
					if (isAwaitExpression(innerNode)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(innerNode.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Do not use await in Effect.gen - use yield* instead to properly handle Effects",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: innerNode
								.getText(sourceFile)
								.slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion:
								"Replace 'await promise' with 'yield* Effect.promise(() => promise)' or convert the async operation to an Effect",
						});
					}

					// Don't recurse into nested Effect.gen calls - they have their own scope
					if (!isEffectGenCall(innerNode)) {
						ts.forEachChild(innerNode, visitGenBody);
					}
				};

				ts.forEachChild(genCallback.body, visitGenBody);
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
