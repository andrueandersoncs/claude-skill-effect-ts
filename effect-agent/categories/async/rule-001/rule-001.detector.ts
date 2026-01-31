/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import {
	Array as EffectArray,
	Function,
	flow,
	Match,
	Option,
	Schema,
	Struct,
} from "effect";
import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.ts";

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
class IsPromiseExpression extends Schema.Class<IsPromiseExpression>("IsPromiseExpression")({
	isNewExpr: Schema.Literal(true),
	isIdentifierExpr: Schema.Literal(true),
	isPromiseText: Schema.Literal(true),
}) {}

// Schema for function node types
// Using type predicates with proper narrowing for TypeScript AST nodes
const isFunctionDeclaration = (u: unknown): u is ts.FunctionDeclaration =>
	ts.isFunctionDeclaration(u as ts.Node);

const isFunctionExpression = (u: unknown): u is ts.FunctionExpression =>
	ts.isFunctionExpression(u as ts.Node);

const isArrowFunction = (u: unknown): u is ts.ArrowFunction =>
	ts.isArrowFunction(u as ts.Node);

const FunctionNode = Schema.Union(
	Schema.declare(isFunctionDeclaration),
	Schema.declare(isFunctionExpression),
	Schema.declare(isArrowFunction),
);

// Base schema for shared violation fields with branded ruleId for type safety
class BaseViolationFields extends Schema.Class<BaseViolationFields>(
	"BaseViolationFields",
)({
	ruleId: Schema.String.pipe(Schema.brand("RuleId")),
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
}) {}

// Schema for violation construction with runtime validation
class ViolationSchema extends Schema.Class<ViolationSchema>("ViolationSchema")({
	...BaseViolationFields.fields,
	suggestion: Schema.optional(Schema.String),
}) {}

// Schema for valid violation objects that matches Violation interface
class ValidViolationWithSuggestion extends Schema.Class<ValidViolationWithSuggestion>("ValidViolationWithSuggestion")({
	...BaseViolationFields.fields,
	suggestion: Schema.String,
}) {}

class ValidViolationWithoutSuggestion extends Schema.Class<ValidViolationWithoutSuggestion>("ValidViolationWithoutSuggestion")({
	...BaseViolationFields.fields,
}) {}

// Helper to validate promise objects using Schema
const validateIsPromiseExpression = (obj: {
	isNewExpr: boolean;
	isIdentifierExpr: boolean;
	isPromiseText: boolean;
}): Option.Option<{
	isNewExpr: boolean;
	isIdentifierExpr: boolean;
	isPromiseText: boolean;
}> =>
	Match.value(obj).pipe(
		Match.when(Schema.is(IsPromiseExpression), () =>
			Option.some({
				isNewExpr: true,
				isIdentifierExpr: true,
				isPromiseText: true,
			}),
		),
		Match.orElse(() => Option.none()),
	);

// Validate violations using Schema.transform for bidirectional conversion

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
					Match.when(
						ts.isIdentifier,
						flow(
							(expr: ts.Identifier) => ({
								isNewExpr: true,
								isIdentifierExpr: true,
								isPromiseText: expr.text === "Promise",
							}),
							validateIsPromiseExpression,
						),
					),
					Match.orElse(() => Option.none()),
				);

				// Use whichever check succeeds
				return Option.match(directCheck, {
					onSome: Function.constant(directCheck),
					onNone: Function.constant(schemaCheck),
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
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
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
										snippet: node
											.getText(sourceFile)
											.slice(0, SNIPPET_MAX_LENGTH),
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
		// Use node.getChildren() to get an array of children and flatMap over them
		const childViolations = node
			.getChildren(sourceFile)
			.flatMap(collectViolations);

		return [...promiseViolations, ...functionViolations, ...childViolations];
	};

	return collectViolations(sourceFile);
};
