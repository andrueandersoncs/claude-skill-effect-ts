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
	AsyncViolation,
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "async",
	name: "generator-yield",
};

const isEffectGenCall = (node: ts.Node): node is ts.CallExpression => {
	if (!ts.isCallExpression(node)) return false;

	const expr = node.expression;
	if (!ts.isPropertyAccessExpression(expr)) return false;

	const obj = expr.expression;
	const prop = expr.name;

	if (!ts.isIdentifier(obj)) return false;
	if (obj.text !== "Effect") return false;
	if (prop.text !== "gen") return false;

	return true;
};

/**
 * Check if a node is a generator function expression
 */
const isGeneratorFunctionExpression = (
	node: ts.Node,
): node is ts.FunctionExpression => {
	return ts.isFunctionExpression(node) && !!node.asteriskToken;
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
		if (isGeneratorFunctionExpression(arg)) {
			return arg;
		}
	}
	return undefined;
};

const isYieldWithoutStar = (node: ts.Node): node is ts.YieldExpression => {
	return ts.isYieldExpression(node) && !node.asteriskToken;
};

const isAwaitExpression = (node: ts.Node): node is ts.AwaitExpression => {
	return ts.isAwaitExpression(node);
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const collectViolations = (): Violation[] => {
		let result: Violation[] = [];

		const visit = (node: ts.Node) => {
			// Look for Effect.gen calls
			if (isEffectGenCall(node)) {
				const genCallback = findGenCallback(node);
				if (genCallback?.body) {
					// Search within the generator body for yield without * or await
					const visitGenBody = (innerNode: ts.Node): Violation[] => {
						let violations: Violation[] = [];

						// Check for yield without *
						if (isYieldWithoutStar(innerNode)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(innerNode.getStart());
							violations = violations.concat(
								new AsyncViolation({
									category: "async",
									ruleId: meta.id,
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
								}),
							);
						}

						// Check for await expressions
						if (isAwaitExpression(innerNode)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(innerNode.getStart());
							violations = violations.concat(
								new AsyncViolation({
									category: "async",
									ruleId: meta.id,
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
								}),
							);
						}

						// Don't recurse into nested Effect.gen calls - they have their own scope
						if (!isEffectGenCall(innerNode)) {
							let childViolations: Violation[] = [];
							ts.forEachChild(innerNode, (child) => {
								childViolations = childViolations.concat(visitGenBody(child));
							});
							violations = violations.concat(childViolations);
						}

						return violations;
					};

					let genBodyViolations: Violation[] = [];
					ts.forEachChild(genCallback.body, (child) => {
						genBodyViolations = genBodyViolations.concat(visitGenBody(child));
					});
					result = result.concat(genBodyViolations);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return result;
	};

	return collectViolations();
};
