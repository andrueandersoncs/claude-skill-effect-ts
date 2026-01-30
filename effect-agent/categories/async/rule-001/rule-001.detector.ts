/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import { Array as EffectArray, Match, Option, Schema, Struct } from "effect";
import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.ts";

const MetaSchema = Schema.Struct({
	id: Schema.Literal("rule-001"),
	category: Schema.Literal("async"),
	name: Schema.Literal("callback-api"),
});

const meta = Schema.decodeUnknownSync(MetaSchema)({
	id: "rule-001",
	category: "async",
	name: "callback-api",
});

// Schema for detecting new Promise() patterns
const IsPromiseExpression = Schema.Struct({
	isNewExpr: Schema.Literal(true),
	isIdentifierExpr: Schema.Literal(true),
	isPromiseText: Schema.Literal(true),
});

// Composable pipeline for schema validation
const validatePromiseExpression = (expr: ts.Identifier) =>
	Match.value({
		isNewExpr: true,
		isIdentifierExpr: true,
		isPromiseText: expr.text === "Promise",
	}).pipe(
		Match.when(Schema.is(IsPromiseExpression), () =>
			Option.some({
				isNewExpr: true,
				isIdentifierExpr: true,
				isPromiseText: true,
			}),
		),
		Match.orElse(() => Option.none()),
	);

// Schema for function node types
const FunctionNode = Schema.Union(
	Schema.declare((u): u is ts.FunctionDeclaration =>
		ts.isFunctionDeclaration(u as ts.Node),
	),
	Schema.declare((u): u is ts.FunctionExpression =>
		ts.isFunctionExpression(u as ts.Node),
	),
	Schema.declare((u): u is ts.ArrowFunction =>
		ts.isArrowFunction(u as ts.Node),
	),
);

// Schema for violation construction with runtime validation
const ViolationSchema = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
	suggestion: Schema.optional(Schema.String),
});

// Schema for valid violation objects that matches Violation interface
const ValidViolationWithSuggestion = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
	suggestion: Schema.String,
});

const ValidViolationWithoutSuggestion = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
});

// Helper to create validated violations using Schema
const createViolation = (data: Omit<Violation, never>): Violation => {
	const decoded = Schema.decodeSync(ViolationSchema)(data);
	// Validate and return the violation based on whether suggestion is present
	return Option.fromNullable(decoded.suggestion).pipe(
		Option.match({
			onSome: (suggestion) =>
				Schema.decodeSync(ValidViolationWithSuggestion)({
					...decoded,
					suggestion,
				}),
			onNone: () => {
				const rest = Struct.omit(decoded, "suggestion");
				return Schema.decodeSync(ValidViolationWithoutSuggestion)(rest);
			},
		}),
	);
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const collectViolations = (node: ts.Node): Violation[] => {
		// Detect new Promise()
		// Combined approach: Use the simpler Option-based method from HEAD with Schema validation from task-4
		const promiseCheck = Match.value(node).pipe(
			Match.when(ts.isNewExpression, (newExpr) => {
				// Try the straightforward Option.filter approach first (from HEAD)
				const directCheck = Option.fromNullable(newExpr.expression).pipe(
					Option.filter(ts.isIdentifier),
					Option.filter((expr) => expr.text === "Promise"),
					Option.map(() => ({
						isNewExpr: true,
						isIdentifierExpr: true,
						isPromiseText: true,
					})),
				);

				// Also support the Schema validation approach (from task-4) as a fallback
				const schemaCheck = Match.value(newExpr.expression).pipe(
					Match.when(ts.isIdentifier, validatePromiseExpression),
					Match.orElse(() => Option.none()),
				);

				// Use whichever check succeeds
				return Option.match(directCheck, {
					onSome: () => directCheck,
					onNone: () => schemaCheck,
				}).pipe(
					Option.flatMap(() => {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						return Option.some(
							createViolation({
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
							}),
						);
					}),
				);
			}),
			Match.orElse(() => Option.none()),
		);

		const promiseViolations = Option.match(promiseCheck, {
			onSome: (v) => [v],
			onNone: () => [],
		});

		// Detect callback patterns (functions with callback parameter names)
		const functionCheckResult = Match.value(node).pipe(
			Match.when(Schema.is(FunctionNode), (typedNode) => {
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

						const hasCallbackName = EffectArray.findFirst(
							callbackNames,
							(name) => {
								// Use regex to check if paramName contains the callback name
								const regex = new RegExp(name);
								return regex.test(paramName);
							},
						);

						return Match.value(hasCallbackName).pipe(
							Match.when(Option.isSome, () => {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								return Option.some(
									createViolation({
										ruleId: meta.id,
										category: meta.category,
										message:
											"Callback-style APIs should be wrapped with Effect.async()",
										filePath,
										line: line + 1,
										column: character + 1,
										snippet: node.getText(sourceFile).slice(0, 100),
										severity: "info",
										certainty: "potential",
										suggestion: "Wrap callback-based APIs with Effect.async()",
									}),
								);
							}),
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
			let violations: Violation[] = [];
			ts.forEachChild(node, (child) => {
				const childResults = collectViolations(child);
				violations = [...violations, ...childResults];
			});
			return violations;
		})();

		return [...promiseViolations, ...functionViolations, ...childViolations];
	};

	return collectViolations(sourceFile);
};
