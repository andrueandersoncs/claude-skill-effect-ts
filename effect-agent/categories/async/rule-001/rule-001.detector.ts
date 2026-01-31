/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import {
	Array as EffectArray,
	Function,
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

// Schema for function node types
// Using type predicates with proper narrowing for TypeScript AST nodes
// Note: Type predicates cannot use Effect.fn() as they must return boolean,
// not Effect. This is a special case where pure type guards are necessary
// for TypeScript AST filtering.

// eslint-disable-next-line @effect-ts/rule-005
const isFunctionDeclaration = (u: unknown): u is ts.FunctionDeclaration =>
	typeof u === "object" && u !== null && ts.isFunctionDeclaration(u);

// eslint-disable-next-line @effect-ts/rule-005
const isFunctionExpression = (u: unknown): u is ts.FunctionExpression =>
	typeof u === "object" && u !== null && ts.isFunctionExpression(u);

// eslint-disable-next-line @effect-ts/rule-005
const isArrowFunction = (u: unknown): u is ts.ArrowFunction =>
	typeof u === "object" && u !== null && ts.isArrowFunction(u);

// Type narrowing helper for FunctionNode types without type assertions
// Using native TypeScript type guards with a discriminated union approach
const isFunctionNode = (node: unknown): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction => {
	return (
		isFunctionDeclaration(node) ||
		isFunctionExpression(node) ||
		isArrowFunction(node)
	);
};

// Schema for function node types using discriminated union of type guards
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

// Schema union for violations - either with or without suggestion
const ValidViolationUnion = Schema.Union(
	ValidViolationWithSuggestion,
	ValidViolationWithoutSuggestion,
);

// Helper to decode violation data, handling the conditional suggestion
// Uses Schema.decodeSync for type-safe validation with proper schema routing
const decodeViolation = (_: ViolationSchema, data: {
	readonly message: string;
	readonly category: string;
	readonly filePath: string;
	readonly line: number;
	readonly column: number;
	readonly snippet: string;
	readonly ruleId: string;
	readonly certainty: "definite" | "potential";
	readonly suggestion?: string | undefined;
}): Violation => {
	const suggestion = Option.fromNullable(data.suggestion);
	if (Option.isSome(suggestion)) {
		return Schema.decodeSync(ValidViolationWithSuggestion)({
			...data,
			suggestion: suggestion.value,
		});
	}
	return Schema.decodeSync(ValidViolationWithoutSuggestion)({
		ruleId: data.ruleId,
		category: data.category,
		message: data.message,
		filePath: data.filePath,
		line: data.line,
		column: data.column,
		snippet: data.snippet,
		certainty: data.certainty,
	});
};

// Helper to encode violation back to schema format
const encodeViolation = (violation: Violation): ViolationSchema =>
	({
		ruleId: violation.ruleId,
		category: violation.category,
		message: violation.message,
		filePath: violation.filePath,
		line: violation.line,
		column: violation.column,
		snippet: violation.snippet,
		certainty: violation.certainty,
		suggestion: violation.suggestion,
	}) as ViolationSchema;

// Schema transform for conditional validation based on suggestion presence
// Routes input to ValidViolationWithSuggestion or ValidViolationWithoutSuggestion
// using Schema.transform pattern for type-safe transformation
const ViolationTransform = Schema.transform(
	ViolationSchema,
	ValidViolationUnion,
	{
		decode: decodeViolation,
		encode: encodeViolation,
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
				// Direct Option-based check without Effect.runSync()
				const directCheck = Option.fromNullable(newExpr.expression).pipe(
					Option.filter(ts.isIdentifier),
					Option.filter((expr) => expr.text === "Promise"),
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

				return directCheck;
			}),
			Match.orElse(() => Option.none()),
		);

		const promiseViolations = Option.match(promiseCheck, {
			onSome: (v) => [v],
			onNone: () => [],
		});

		// Detect callback patterns (functions with callback parameter names)
		const functionCheckResult = Match.value(node).pipe(
			Match.when((n): n is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction => isFunctionNode(n), (typedNode) => {
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
