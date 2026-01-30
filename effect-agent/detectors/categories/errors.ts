/**
 * Error handling detector
 *
 * Detects try/catch, throw statements, and untyped errors
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const errorsDetector: CategoryDetector = {
	category: "errors",
	description: "Detects try/catch, throw, and untyped error patterns",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect try/catch statements
			if (ts.isTryStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effect-try",
					category: "errors",
					message: "try/catch blocks should be replaced with Effect.try()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use Effect.try() for sync operations or Effect.tryPromise() for async",
				});
			}

			// Detect throw statements
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
					ruleId: "typed-errors",
					category: "errors",
					message: "throw statements should be replaced with Effect.fail()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion,
				});
			}

			// Detect new Error() without throw (may be used with Effect.fail)
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
						ruleId: "typed-errors",
						category: "errors",
						message: "new Error() should be replaced with Schema.TaggedError",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion: "Define typed errors using Schema.TaggedError class",
					});
				}
			}

			// Detect classes extending Error (should use Schema.TaggedError)
			if (ts.isClassDeclaration(node) && node.heritageClauses) {
				for (const clause of node.heritageClauses) {
					if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
						for (const type of clause.types) {
							const typeName = type.expression.getText(sourceFile);
							if (
								typeName === "Error" ||
								typeName === "TypeError" ||
								typeName === "RangeError"
							) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: "typed-errors",
									category: "errors",
									message: `Class extending ${typeName} should use Schema.TaggedError instead`,
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node.getText(sourceFile).slice(0, 100),
									severity: "error",
									certainty: "definite",
									suggestion:
										"Use Schema.TaggedError() or Data.TaggedError() for typed errors",
								});
							}
						}
					}
				}
			}

			// Detect Promise.reject (should use Effect.fail)
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (
					ts.isIdentifier(obj) &&
					obj.text === "Promise" &&
					method === "reject"
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "typed-errors",
						category: "errors",
						message: "Promise.reject() should be replaced with Effect.fail()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Effect.fail() with a typed error",
					});
				}
			}

			// Detect catch clauses with untyped error parameter
			if (ts.isCatchClause(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				// Check if error parameter has 'any' or 'unknown' type annotation
				const param = node.variableDeclaration;
				let hasTypedError = false;

				if (param?.type) {
					const typeText = param.type.getText(sourceFile);
					hasTypedError = typeText !== "any" && typeText !== "unknown";
				}

				violations.push({
					ruleId: "effect-try",
					category: "errors",
					message: hasTypedError
						? "catch clause should be replaced with Effect error handling"
						: "catch clause has untyped error parameter",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use Effect.catchTag() or Effect.catchAll() with typed errors",
				});
			}

			// Detect console.error (potential unhandled error logging)
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (
					ts.isIdentifier(obj) &&
					obj.text === "console" &&
					method === "error"
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "typed-errors",
						category: "errors",
						message: "console.error may indicate unstructured error handling",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion: "Use Effect.log or structured error types instead",
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
