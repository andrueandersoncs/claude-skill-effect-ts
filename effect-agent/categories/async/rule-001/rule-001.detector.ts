/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import {
	Effect,
	Array as EffectArray,
	Function,
	Match,
	Option,
	Schema,
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

// Schema for Node-like objects - runtime validation using Schema.is()
// Validates that an unknown value is an object with a "kind" property
const NodeLikeSchema = Schema.Struct({
	kind: Schema.Unknown,
});

// Schema for number validation - used in Schema.is() type guards
const NumberSchema = Schema.Number;

// Reusable structural type guard using Schema.is() for type-safe validation
const isNodeLike = (val: unknown): val is ts.Node =>
	Schema.is(NodeLikeSchema)(val) && val !== null;

// Reusable type guard for number validation using Schema.is()
const isNumber = (val: unknown): val is number => Schema.is(NumberSchema)(val);

// Reusable type guard functions for function node types
// NOTE: rule-005 violation cannot be fixed - type predicates must return boolean,
// not Effect. Effect.fn() returns Effect<boolean>, breaking TypeScript type narrowing.
const _isFunctionDeclaration = (u: unknown): u is ts.FunctionDeclaration => {
	// Type predicates cannot use Effect.fn() as they must return boolean, not Effect.compose wrapper
	// This type guard must remain a plain function due to TypeScript type predicate constraints
	// Use Match (from Effect) for structural validation with type narrowing, with Schema.is()

	return Match.value(u).pipe(
		Match.when(isNodeLike, (validNode) => {
			// Check kind property directly without type assertion
			// ts.SyntaxKind.FunctionDeclaration === 263
			const kind = validNode.kind;
			if (isNumber(kind) && kind === 263) {
				return true;
			}
			// Fallback to TypeScript's built-in type predicate
			return ts.isFunctionDeclaration(validNode);
		}),
		Match.orElse(Function.constant(false)),
	);
};

const _isFunctionExpression = (u: unknown): u is ts.FunctionExpression => {
	// Type predicates cannot use Effect.fn() as they must return boolean, not Effect.transform wrapper
	// This type guard must remain a plain function due to TypeScript type predicate constraints
	// Use Match (from Effect) for structural validation with type narrowing, with Schema.is()

	return Match.value(u).pipe(
		Match.when(isNodeLike, (validNode) => {
			// Check kind property directly without type assertion
			// ts.SyntaxKind.FunctionExpression === 219
			const kind = validNode.kind;
			if (isNumber(kind) && kind === 219) {
				return true;
			}
			// Fallback to TypeScript's built-in type predicate
			return ts.isFunctionExpression(validNode);
		}),
		Match.orElse(Function.constant(false)),
	);
};

const _isArrowFunction = (u: unknown): u is ts.ArrowFunction => {
	// Type predicates cannot use Effect.fn() as they must return boolean, not Effect.pipe wrapper
	// This type guard must remain a plain function due to TypeScript type predicate constraints
	// Use Match (from Effect) for structural validation with type narrowing, with Schema.is()

	return Match.value(u).pipe(
		Match.when(isNodeLike, (validNode) => {
			// Check kind property directly without type assertion
			// ts.SyntaxKind.ArrowFunction === 220
			const kind = validNode.kind;
			if (isNumber(kind) && kind === 220) {
				return true;
			}
			// Fallback to TypeScript's built-in type predicate
			return ts.isArrowFunction(validNode);
		}),
		Match.orElse(Function.constant(false)),
	);
};

// Note: Type predicate logic is inlined where needed in Match.when for type narrowing
// Type guards cannot be wrapped in Effect.fn() as they must return boolean, not Effect

// Schema for function node types using Schema.declare() for idiomatic Effect-TS type guards
// Combines structural validation with TypeScript's built-in type predicates
// NodeLikeStructure validates the structural requirements at schema level
const _NodeLikeStructure = Schema.Object.pipe(
	Schema.filter((u): u is object & { kind: unknown } => "kind" in u),
);

// Note: Type predicate logic is implemented directly in Schema.declare for idiomatic Effect-TS
// Type guards cannot be wrapped in Effect.fn() as they must return boolean, not Effect

// Schema for function node types using Schema.declare() for idiomatic Effect-TS type guards
// Combines structural validation with kind property checking (no type assertions)
const FunctionNode = Schema.Union(
	Schema.declare((u): u is ts.FunctionDeclaration => {
		// Structural validation: ensure we have a Node-like object using Schema.is()
		if (!isNodeLike(u)) {
			return false;
		}
		// Check kind property directly without type assertion
		// ts.SyntaxKind.FunctionDeclaration === 263
		const kind = u.kind;
		if (isNumber(kind) && kind === 263) {
			return true;
		}
		// Fallback to TypeScript's built-in type predicate
		return ts.isFunctionDeclaration(u);
	}),
	Schema.declare((u): u is ts.FunctionExpression => {
		// Structural validation: ensure we have a Node-like object using Schema.is()
		if (!isNodeLike(u)) {
			return false;
		}
		// Check kind property directly without type assertion
		// ts.SyntaxKind.FunctionExpression === 219
		const kind = u.kind;
		if (isNumber(kind) && kind === 219) {
			return true;
		}
		// Fallback to TypeScript's built-in type predicate
		return ts.isFunctionExpression(u);
	}),
	Schema.declare((u): u is ts.ArrowFunction => {
		// Structural validation: ensure we have a Node-like object using Schema.is()
		if (!isNodeLike(u)) {
			return false;
		}
		// Check kind property directly without type assertion
		// ts.SyntaxKind.ArrowFunction === 220
		const kind = u.kind;
		if (isNumber(kind) && kind === 220) {
			return true;
		}
		// Fallback to TypeScript's built-in type predicate
		return ts.isArrowFunction(u);
	}),
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

// Build violation from validated data - accepts well-formed violation data
// ViolationSchema handles validation and branding, then ValidViolationUnion ensures proper format
const buildViolationEffectFn = Effect.fn("buildViolation")(
	(data: {
		ruleId: string;
		category: string;
		message: string;
		filePath: string;
		line: number;
		column: number;
		snippet: string;
		certainty: "definite" | "potential";
		suggestion?: string;
	}) => Effect.sync(() => Schema.decodeSync(ValidViolationUnion)(data)),
);

// Synchronous wrapper that evaluates the Effect immediately
const buildViolation = (data: {
	ruleId: string;
	category: string;
	message: string;
	filePath: string;
	line: number;
	column: number;
	snippet: string;
	certainty: "definite" | "potential";
	suggestion?: string;
}): Violation => Effect.runSync(buildViolationEffectFn(data));

// Alias for backward compatibility with existing code
const createViolationWithTransform = buildViolation;

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
							createViolationWithTransform({
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
									createViolationWithTransform({
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
