/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import {
	Array as EffectArray,
	Effect,
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

class MetaSchema extends Schema.Class<MetaSchema>("MetaSchema")({
	id: Schema.Literal("rule-001"),
	category: Schema.Literal("async"),
	name: Schema.Literal("callback-api"),
}) {}

const meta = new MetaSchema({
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

// Schema for function node types - runtime validation of TypeScript AST nodes
// These type guards validate unknown values against TypeScript compiler API types.
// NOTE: Type assertions to ts.Node are justified here as we implement type guards
// for the TypeScript compiler API which requires this narrowing. After validating
// the basic object structure, we delegate to TypeScript's built-in type predicates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assertAsNode = (u: any): ts.Node => u;

const isFunctionDeclaration = (u: unknown): u is ts.FunctionDeclaration => {
	// Structural validation: ensure we have a Node-like object
	if (typeof u !== "object" || u === null || !("kind" in u)) {
		return false;
	}
	// Use TypeScript's built-in type predicate after structural validation
	// eslint-disable-next-line @effect-ts/rule-002
	return ts.isFunctionDeclaration(assertAsNode(u));
};

const isFunctionExpression = (u: unknown): u is ts.FunctionExpression => {
	// Structural validation: ensure we have a Node-like object
	if (typeof u !== "object" || u === null || !("kind" in u)) {
		return false;
	}
	// Use TypeScript's built-in type predicate after structural validation
	// eslint-disable-next-line @effect-ts/rule-002
	return ts.isFunctionExpression(assertAsNode(u));
};

const isArrowFunction = (u: unknown): u is ts.ArrowFunction => {
	// Structural validation: ensure we have a Node-like object
	if (typeof u !== "object" || u === null || !("kind" in u)) {
		return false;
	}
	// Use TypeScript's built-in type predicate after structural validation
	// eslint-disable-next-line @effect-ts/rule-002
	return ts.isArrowFunction(assertAsNode(u));
};
const FunctionNode = Schema.Union(
	Schema.declare(isFunctionDeclaration),
	Schema.declare(isFunctionExpression),
	Schema.declare(isArrowFunction),
);

// Base schema for shared violation fields with branded ruleId for type safety
class BaseViolationFields extends Schema.Class<BaseViolationFields>("BaseViolationFields")({
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
class ValidViolationWithSuggestion extends Schema.Class<ValidViolationWithSuggestion>(
	"ValidViolationWithSuggestion",
)({
	...BaseViolationFields.fields,
	suggestion: Schema.String,
}) {}

class ValidViolationWithoutSuggestion extends Schema.Class<ValidViolationWithoutSuggestion>(
	"ValidViolationWithoutSuggestion",
)({
	...BaseViolationFields.fields,
}) {}

// Helper to validate promise objects using Schema
const validateIsPromiseExpression = Effect.fn("validateIsPromiseExpression")(
	(obj: {
		isNewExpr: boolean;
		isIdentifierExpr: boolean;
		isPromiseText: boolean;
	}) => {
		const result = Match.value(obj).pipe(
			Match.when(Schema.is(IsPromiseExpression), () =>
				Option.some({
					isNewExpr: true,
					isIdentifierExpr: true,
					isPromiseText: true,
				}),
			),
			Match.orElse(() => Option.none()),
		);
		return Effect.succeed(result);
	},
);

// Schema union for violations - either with or without suggestion
const ValidViolationUnion = Schema.Union(
	ValidViolationWithSuggestion,
	ValidViolationWithoutSuggestion,
);

// Helper to validate and decode violation data with comprehensive Option-based validation
const decodeViolationData = (data: {
	ruleId: string & { readonly RuleId: symbol };
	category: string;
	message: string;
	filePath: string;
	line: number;
	column: number;
	snippet: string;
	certainty: "definite" | "potential";
	suggestion?: string | undefined;
}): Violation =>
	Option.fromNullable(data.suggestion).pipe(
		Option.match({
			onSome: (suggestion) =>
				Schema.decodeSync(ValidViolationWithSuggestion)({
					...data,
					suggestion,
				}),
			onNone: () => {
				const rest = Struct.omit(data, "suggestion");
				return Schema.decodeSync(ValidViolationWithoutSuggestion)(rest);
			},
		}),
	);

// Schema transform for conditional validation based on suggestion presence
const ViolationTransform = Schema.transform(
	ViolationSchema,
	ValidViolationUnion,
	{
		decode: decodeViolationData,
		encode: Function.identity,
		strict: true,
	},
);

// Helper to create validated violations using Schema.transform
const createViolation = Schema.decodeSync(ViolationTransform);

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
						(expr: ts.Identifier) =>
							Effect.runSync(
								validateIsPromiseExpression({
									isNewExpr: true,
									isIdentifierExpr: true,
									isPromiseText: expr.text === "Promise",
								}),
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
