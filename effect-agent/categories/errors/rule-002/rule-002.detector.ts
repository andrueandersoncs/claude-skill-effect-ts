/**
 * rule-002: catch-tag-recovery
 *
 * Rule: Use Effect.catchTag/catchTags with Schema.TaggedError for type-safe error recovery
 *
 * This detector consolidates:
 * - Manual _tag checking (should use Effect.catchTag)
 * - Switch on _tag (should use Effect.catchTags)
 * - Data.TaggedError usage (should use Schema.TaggedError)
 * - Classes extending Error (should use Schema.TaggedError)
 * - throw statements and Promise.reject (should use Effect.fail)
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "errors",
	name: "catch-tag-recovery",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// === Detection 1: Manual _tag checking (from original rule-002) ===
		if (ts.isPropertyAccessExpression(node) && node.name.text === "_tag") {
			let parent = node.parent;
			while (parent) {
				if (
					ts.isBinaryExpression(parent) &&
					(parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
						parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Manual _tag checking should use Effect.catchTag",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: parent.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion: "Use Effect.catchTag() for type-safe error handling",
					});
					break;
				}
				parent = parent.parent;
			}
		}

		// === Detection 2: Switch on _tag (from rule-003) ===
		if (ts.isSwitchStatement(node)) {
			const expr = node.expression;
			if (ts.isPropertyAccessExpression(expr) && expr.name.text === "_tag") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "switch on error._tag should use Effect.catchTags",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion:
						"Use Effect.catchTags() for handling multiple error types",
				});
			}
		}

		// === Detection 3: Data.TaggedError usage (from discriminated-unions/rule-005) ===
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (
				ts.isIdentifier(obj) &&
				obj.text === "Data" &&
				method === "TaggedError"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Data.TaggedError; use Schema.TaggedError for full Schema compatibility",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion:
						"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { ... }) for encoding/decoding support",
				});
			}

			// Detection: Promise.reject (from rule-012)
			if (
				ts.isIdentifier(obj) &&
				obj.text === "Promise" &&
				method === "reject"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Promise.reject() should be replaced with Effect.fail()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion: "Use Effect.fail() with a typed error",
				});
			}

			// Detection: console.error (from rule-012)
			if (
				ts.isIdentifier(obj) &&
				obj.text === "console" &&
				method === "error"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "console.error may indicate unstructured error handling",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion: "Use Effect.log or structured error types instead",
				});
			}
		}

		// === Detection 4: extends Data.TaggedError in class heritage (from discriminated-unions/rule-005) ===
		if (ts.isClassDeclaration(node) && node.heritageClauses) {
			for (const clause of node.heritageClauses) {
				if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
					for (const type of clause.types) {
						const typeText = type.expression.getText(sourceFile);

						// Data.TaggedError
						if (typeText.includes("Data.TaggedError")) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Class extends Data.TaggedError; use Schema.TaggedError",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: `class ${node.name?.text || "..."} extends Data.TaggedError`,
								certainty: "definite",
								suggestion:
									"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { ... }) for Schema integration",
							});
						}

						// Native Error types (from rule-012)
						if (
							typeText === "Error" ||
							typeText === "TypeError" ||
							typeText === "RangeError"
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message: `Class extending ${typeText} should use Schema.TaggedError instead`,
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								certainty: "definite",
								suggestion:
									"Use Schema.TaggedError() or Data.TaggedError() for typed errors",
							});
						}
					}
				}
			}
		}

		// === Detection 5: throw statements (from rule-012) ===
		if (ts.isThrowStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			let suggestion = "Use Effect.fail() with a typed error";

			// Check if throwing new Error
			if (
				node.expression &&
				ts.isNewExpression(node.expression) &&
				ts.isIdentifier(node.expression.expression)
			) {
				const errorType = node.expression.expression.text;
				if (errorType === "Error") {
					suggestion =
						"Define a Schema.TaggedError class and use Effect.fail()";
				}
			}

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "throw statements should be replaced with Effect.fail()",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion,
			});
		}

		// === Detection 6: new Error() without throw (from rule-012) ===
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Error"
		) {
			// Check if it's inside Effect.fail() - that's okay
			let parent = node.parent;
			let isInEffectFail = false;
			while (parent) {
				if (
					ts.isCallExpression(parent) &&
					ts.isPropertyAccessExpression(parent.expression) &&
					parent.expression.name.text === "fail"
				) {
					isInEffectFail = true;
					break;
				}
				parent = parent.parent;
			}

			if (!isInEffectFail) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "new Error() should be replaced with Schema.TaggedError",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion: "Define typed errors using Schema.TaggedError class",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
