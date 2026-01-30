/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import { Match, Option, Schema } from "effect";
import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "async",
	name: "callback-api",
};

// Schema for valid severity and certainty values
const SeveritySchema = Schema.Literal("error", "warning", "info");
const CertaintySchema = Schema.Literal("definite", "potential");

// Schema for detecting new Promise() patterns
const IsPromiseExpression = Schema.Struct({
	isNewExpr: Schema.Literal(true),
	isIdentifierExpr: Schema.Literal(true),
	isPromiseText: Schema.Literal(true),
});

// Schema for Violation to enforce literal types for severity and certainty
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

// Predicate to check if node is a function type
const isFunctionNode = (node: ts.Node): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
	ts.isFunctionDeclaration(node) ||
	ts.isFunctionExpression(node) ||
	ts.isArrowFunction(node);

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
const createViolation = (
	data: Omit<Violation, never>,
): Violation => {
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
				const { suggestion, ...rest } = decoded;
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

						return Match.value(callbackNames).pipe(
							Match.when(
								(names) => names.some((name) => paramName.includes(name)),
								() => {
									const { line, character } = sourceFile.getLineAndCharacterOfPosition(
										node.getStart(),
									);
									return Option.some(
										createViolation({
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
										}),
									);
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
