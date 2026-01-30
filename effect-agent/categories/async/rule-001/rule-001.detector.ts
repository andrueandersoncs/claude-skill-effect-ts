/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import { Array as EffectArray, Match, Option, Schema } from "effect";
import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "async",
	name: "callback-api",
};

// Schema for detecting new Promise() patterns
const IsPromiseExpression = Schema.Struct({
	isNewExpr: Schema.Literal(true),
	isIdentifierExpr: Schema.Literal(true),
	isPromiseText: Schema.Literal(true),
});

// Predicate to check if node is a function type
const isFunctionNode = (node: ts.Node): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
	ts.isFunctionDeclaration(node) ||
	ts.isFunctionExpression(node) ||
	ts.isArrowFunction(node);

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const collectViolations = (node: ts.Node): Violation[] => {
		// Detect new Promise()
		const promiseCheck = Match.value({
			isNewExpr: ts.isNewExpression(node),
			isIdentifierExpr:
				ts.isNewExpression(node) && ts.isIdentifier(node.expression),
			isPromiseText:
				ts.isNewExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "Promise",
		}).pipe(
			Match.when(Schema.is(IsPromiseExpression), () => {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				return Option.some({
					ruleId: meta.id,
					category: meta.category,
					message: "new Promise() should be replaced with Effect.async()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error" as const,
					certainty: "definite" as const,
					suggestion: "Use Effect.async() for callback-based APIs",
				});
			}),
			Match.orElse(() => Option.none()),
		);

		const promiseViolations = Option.match(promiseCheck, {
			onSome: (v) => [v],
			onNone: () => [],
		});

		// Detect callback patterns (functions with callback parameter names)
		const functionCheckResult = Match.value(node).pipe(
			Match.when(isFunctionNode, (typedNode) => {
				return Option.fromNullable(typedNode.parameters.at(-1)).pipe(
					Option.flatMap((lastParam) => {
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

						const hasCallbackName = EffectArray.findFirst(callbackNames, (name) => {
							// Use regex to check if paramName contains the callback name
							const regex = new RegExp(name);
							return regex.test(paramName);
						});

						return Match.value(hasCallbackName).pipe(
							Match.when(
								Option.isSome,
								() => {
									const { line, character } = sourceFile.getLineAndCharacterOfPosition(
										node.getStart(),
									);
									return Option.some({
										ruleId: meta.id,
										category: meta.category,
										message: "Callback-style APIs should be wrapped with Effect.async()",
										filePath,
										line: line + 1,
										column: character + 1,
										snippet: node.getText(sourceFile).slice(0, 100),
										severity: "info" as const,
										certainty: "potential" as const,
										suggestion: "Wrap callback-based APIs with Effect.async()",
									});
								},
							),
							Match.orElse(() => Option.none()),
						);
					}),
				);
			}),
			Match.orElse(() => Option.none<Violation>()),
		);

		const functionViolations = Option.match(functionCheckResult, {
			onSome: (v) => [v],
			onNone: () => [],
		});

		// Recursively collect violations from child nodes using a functional approach
		const childViolations = (() => {
			const violations: Violation[] = [];
			ts.forEachChild(node, (child) => {
				const childResults = collectViolations(child);
				violations.push(...childResults);
			});
			return violations;
		})();

		return [...promiseViolations, ...functionViolations, ...childViolations];
	};

	return collectViolations(sourceFile);
};
