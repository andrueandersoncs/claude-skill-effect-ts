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

// Schema for function node types - runtime validation of TypeScript AST nodes
// These type guards validate unknown values against TypeScript compiler API types.
// NOTE: Type assertions to ts.Node are justified here as we implement type guards
// for the TypeScript compiler API which requires this narrowing. After validating
// the basic object structure, we delegate to TypeScript's built-in type predicates.
// Type predicates cannot use Effect.fn() as they must return boolean, not Effect.
// This is a special case where pure type guards are necessary for TypeScript AST filtering.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assertAsNode = (u: any): ts.Node => u;

// Schema for structural validation: ensure we have a Node-like object with a "kind" property
const NodeLike = Schema.Struct({
	kind: Schema.Unknown,
});

// Helper function to validate structural properties with Schema (from task-001)
const isValidNode = (u: unknown): boolean =>
	Match.value(u).pipe(
		Match.when(Schema.is(NodeLike), () => true),
		Match.orElse(() => false),
	);

// Helper to validate structural requirements for TypeScript AST nodes (from task-005)
// Returns Option to enable Option.match for null checking
const validateNodeStructure = (u: unknown): Option.Option<unknown> =>
	Option.fromNullable(u).pipe(
		Option.filter((val) => typeof val === "object"),
		Option.filter((val) => val !== null),
		Option.filter((val) => "kind" in val),
	);

const isFunctionDeclaration = (u: unknown): u is ts.FunctionDeclaration => {
	// Combined validation: use both Schema-based and Option-based approaches
	// Both validate structural requirements, Schema-based handles edge cases (from task-001)
	// Use Option-based validation with TypeScript's built-in type predicate (from task-005)
	return validateNodeStructure(u).pipe(
		Option.match({
			onSome: (val) => {
				// Verify with both approaches: Schema validation AND TypeScript's type predicate
				return isValidNode(val) && ts.isFunctionDeclaration(assertAsNode(val));
			},
			onNone: () => false,
		}),
	);
};

const isFunctionExpression = (u: unknown): u is ts.FunctionExpression => {
	// Combined validation: use both Schema-based and Option-based approaches
	// Both validate structural requirements, Schema-based handles edge cases (from task-001)
	// Use Option-based validation with TypeScript's built-in type predicate (from task-005)
	return validateNodeStructure(u).pipe(
		Option.match({
			onSome: (val) => {
				// Verify with both approaches: Schema validation AND TypeScript's type predicate
				// eslint-disable-next-line @effect-ts/rule-002
				return isValidNode(val) && ts.isFunctionExpression(assertAsNode(val));
			},
			onNone: () => false,
		}),
	);
};

const isArrowFunction = (u: unknown): u is ts.ArrowFunction => {
	// Combined validation: use both Schema-based and Option-based approaches
	// Both validate structural requirements, Schema-based handles edge cases (from task-001)
	// Use Option-based validation with TypeScript's built-in type predicate (from task-005)
	return validateNodeStructure(u).pipe(
		Option.match({
			onSome: (val) => {
				// Verify with both approaches: Schema validation AND TypeScript's type predicate
				// eslint-disable-next-line @effect-ts/rule-002
				return isValidNode(val) && ts.isArrowFunction(assertAsNode(val));
			},
			onNone: () => false,
		}),
	);
};

// Type narrowing helper for FunctionNode types using Schema-based validation
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

// Schema for valid violation objects using Schema.transform to normalize optional suggestion
const ValidViolation = Schema.transform(
	ViolationSchema,
	Schema.Struct({
		...BaseViolationFields.fields,
		suggestion: Schema.optional(Schema.String),
	}),
	{
		decode: Function.identity,
		encode: Function.identity,
		strict: true,
	},
);

// Type definition for violation data
type ViolationData = {
	ruleId: string & { readonly RuleId: symbol };
	category: string;
	message: string;
	filePath: string;
	line: number;
	column: number;
	snippet: string;
	certainty: "definite" | "potential";
	suggestion?: string | undefined;
};

// Helper to create validated violations using Schema.transform
const createViolation = Schema.decodeSync(ValidViolation);

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
