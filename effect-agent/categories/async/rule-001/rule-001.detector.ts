/**
 * rule-001: callback-api
 * Never use new Promise(); use Effect.async for callback-based APIs
 */

import {
	Array as A,
	Effect,
	Function as F,
	Match,
	Option,
	pipe,
	Schema,
} from "effect";
import * as ts from "typescript";
import {
	AsyncViolation,
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

class Meta extends Schema.Class<Meta>("Meta")({
	id: Schema.Literal("rule-001"),
	category: Schema.Literal("async"),
	name: Schema.Literal("callback-api"),
}) {}

const meta = new Meta({
	id: "rule-001",
	category: "async",
	name: "callback-api",
});

// ─────────────────────────────────────────────────────────────────────────────
// Violation Builder
// ─────────────────────────────────────────────────────────────────────────────

class ViolationInput extends Schema.Class<ViolationInput>("ViolationInput")({
	message: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	certainty: Schema.Literal("definite", "potential"),
	suggestion: Schema.String,
}) {}

const makeViolation = Effect.fn("makeViolation")(
	(
		filePath: string,
		input: typeof ViolationInput.Type,
	): Effect.Effect<Violation> =>
		Effect.succeed(
			new AsyncViolation({
				category: "async",
				ruleId: meta.id,
				message: input.message,
				filePath,
				line: input.line,
				column: input.column,
				snippet: input.snippet,
				certainty: input.certainty,
				suggestion: input.suggestion,
			}),
		),
);

// ─────────────────────────────────────────────────────────────────────────────
// AST Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getPosition = Effect.fn("getPosition")(
	(
		node: ts.Node,
		sourceFile: ts.SourceFile,
	): Effect.Effect<{ line: number; column: number }> =>
		Effect.sync(() => {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			return { line: line + 1, column: character + 1 };
		}),
);

const getSnippet = Effect.fn("getSnippet")(
	(node: ts.Node, sourceFile: ts.SourceFile): Effect.Effect<string> =>
		Effect.succeed(node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH)),
);

const CALLBACK_NAMES = [
	"callback",
	"cb",
	"done",
	"next",
	"resolve",
	"reject",
	"handler",
];

const containsCallbackName = Effect.fn("containsCallbackName")(
	(paramName: string): Effect.Effect<boolean> =>
		Effect.succeed(
			pipe(
				CALLBACK_NAMES,
				A.some(
					(name) =>
						pipe(
							A.findFirstIndex(
								paramName.toLowerCase().split(""),
								(c) => c === name.charAt(0),
							),
							Option.isSome,
						) && paramName.toLowerCase().includes(name),
				),
			),
		),
);

const isFunctionLike = (
	node: ts.Node,
): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
	Match.value(node).pipe(
		Match.when(ts.isFunctionDeclaration, F.constTrue),
		Match.when(ts.isFunctionExpression, F.constTrue),
		Match.when(ts.isArrowFunction, F.constTrue),
		Match.orElse(F.constFalse),
	);

// ─────────────────────────────────────────────────────────────────────────────
// Detectors
// ─────────────────────────────────────────────────────────────────────────────

const detectNewPromise = Effect.fn("detectNewPromise")(
	(
		node: ts.Node,
		sourceFile: ts.SourceFile,
		filePath: string,
	): Effect.Effect<Option.Option<Violation>> =>
		Match.value(node).pipe(
			Match.when(ts.isNewExpression, (expr) => {
				const exprOpt = Option.fromNullable(expr.expression);
				const isPromise = pipe(
					exprOpt,
					Option.filter(ts.isIdentifier),
					Option.filter((id) => id.text === "Promise"),
					Option.isSome,
				);

				return Match.value(isPromise).pipe(
					Match.when(true, () =>
						Effect.gen(function* () {
							const pos = yield* getPosition(node, sourceFile);
							const snippet = yield* getSnippet(node, sourceFile);
							const violation = yield* makeViolation(filePath, {
								message: "new Promise() should be replaced with Effect.async()",
								line: pos.line,
								column: pos.column,
								snippet,
								certainty: "definite",
								suggestion: "Use Effect.async() for callback-based APIs",
							});
							return Option.some(violation);
						}),
					),
					Match.orElse(() => Effect.succeed(Option.none())),
				);
			}),
			Match.orElse(() => Effect.succeed(Option.none())),
		),
);

const detectCallbackFunction = Effect.fn("detectCallbackFunction")(
	(
		node: ts.Node,
		sourceFile: ts.SourceFile,
		filePath: string,
	): Effect.Effect<Option.Option<Violation>> =>
		Match.type<ts.Node>().pipe(
			Match.when(isFunctionLike, (funcNode) => {
				const lastParam = Option.fromNullable(funcNode.parameters.at(-1));
				const paramName = pipe(
					lastParam,
					Option.map((p) => p.name.getText(sourceFile)),
				);

				return pipe(
					paramName,
					Option.match({
						onNone: () => Effect.succeed(Option.none<Violation>()),
						onSome: (name) =>
							Effect.gen(function* () {
								const hasCallback = yield* containsCallbackName(name);
								return yield* Match.value(hasCallback).pipe(
									Match.when(true, () =>
										Effect.gen(function* () {
											const pos = yield* getPosition(node, sourceFile);
											const snippet = yield* getSnippet(node, sourceFile);
											const violation = yield* makeViolation(filePath, {
												message:
													"Callback-style APIs should be wrapped with Effect.async()",
												line: pos.line,
												column: pos.column,
												snippet,
												certainty: "potential",
												suggestion:
													"Wrap callback-based APIs with Effect.async()",
											});
											return Option.some(violation);
										}),
									),
									Match.orElse(() => Effect.succeed(Option.none())),
								);
							}),
					}),
				);
			}),
			Match.orElse(() => Effect.succeed(Option.none())),
		)(node),
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Detection
// ─────────────────────────────────────────────────────────────────────────────

const collectViolations = Effect.fn("collectViolations")(
	(
		sourceFile: ts.SourceFile,
		filePath: string,
	): Effect.Effect<readonly Violation[]> =>
		Effect.gen(function* () {
			const processNode = (
				node: ts.Node,
			): Effect.Effect<readonly Violation[]> =>
				Effect.gen(function* () {
					const promiseViolation = yield* detectNewPromise(
						node,
						sourceFile,
						filePath,
					);
					const callbackViolation = yield* detectCallbackFunction(
						node,
						sourceFile,
						filePath,
					);

					const nodeViolations = pipe(
						[promiseViolation, callbackViolation],
						A.filterMap(F.identity),
					);

					const children = node.getChildren(sourceFile);
					const childViolations = yield* pipe(
						children,
						Effect.forEach((child) => processNode(child)),
						Effect.map(A.flatten),
					);

					return pipe(nodeViolations, A.appendAll(childViolations));
				});

			return yield* processNode(sourceFile);
		}),
);

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => [...Effect.runSync(collectViolations(sourceFile, filePath))];
