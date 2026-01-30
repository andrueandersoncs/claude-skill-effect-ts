/**
 * Testing detector
 *
 * Detects improper testing patterns for Effect code
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const testingDetector: CategoryDetector = {
	category: "testing",
	description: "Detects improper Effect testing patterns",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];

		// Only check test files
		if (
			!filePath.includes(".test.") &&
			!filePath.includes(".spec.") &&
			!filePath.includes("__tests__")
		) {
			return violations;
		}

		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		// Track imports to check for @effect/vitest
		let hasEffectVitestImport = false;
		let hasVitestImport = false;

		const visit = (node: ts.Node) => {
			// Check imports
			if (ts.isImportDeclaration(node)) {
				const moduleSpecifier = node.moduleSpecifier;
				if (ts.isStringLiteral(moduleSpecifier)) {
					const moduleName = moduleSpecifier.text;
					if (moduleName === "@effect/vitest") {
						hasEffectVitestImport = true;
					}
					if (moduleName === "vitest") {
						hasVitestImport = true;
					}
				}
			}

			// Detect Effect.runPromise/runSync in tests (should use it.effect)
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (ts.isIdentifier(obj) && obj.text === "Effect") {
					if (
						method === "runPromise" ||
						method === "runSync" ||
						method === "runPromiseExit" ||
						method === "runSyncExit"
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: "it-effect",
							category: "testing",
							message: `Effect.${method}() in tests should use it.effect() from @effect/vitest`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "error",
							certainty: "definite",
							suggestion:
								"Use it.effect('test name', () => Effect.gen(...)) from @effect/vitest",
						});
					}
				}
			}

			// Detect manual test data instead of Arbitrary
			if (ts.isArrayLiteralExpression(node)) {
				// Check if this looks like test data
				const parent = node.parent;
				if (
					parent &&
					ts.isVariableDeclaration(parent) &&
					ts.isIdentifier(parent.name)
				) {
					const varName = parent.name.text.toLowerCase();
					if (
						varName.includes("test") ||
						varName.includes("mock") ||
						varName.includes("fixture") ||
						varName.includes("sample") ||
						varName.includes("data")
					) {
						const elements = node.elements;
						if (elements.length > 2) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: "arbitrary-test-layer",
								category: "testing",
								message:
									"Manual test data arrays should use Arbitrary.make(Schema)",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Use Arbitrary.make(YourSchema) to generate test data from schemas",
							});
						}
					}
				}
			}

			// Detect it() without effect (should potentially be it.effect)
			if (
				ts.isCallExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "it"
			) {
				// Check if the callback returns an Effect
				const args = node.arguments;
				if (args.length >= 2) {
					const callback = args[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);
						if (
							bodyText.includes("Effect.") ||
							bodyText.includes("yield*") ||
							bodyText.includes("Effect.gen")
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: "it-effect",
								category: "testing",
								message:
									"Tests with Effects should use it.effect() from @effect/vitest",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "error",
								certainty: "potential",
								suggestion:
									"Replace it() with it.effect() for Effect-based tests",
							});
						}
					}
				}
			}

			// Detect test() instead of it.effect()
			if (
				ts.isCallExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "test"
			) {
				const args = node.arguments;
				if (args.length >= 2) {
					const callback = args[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);
						if (
							bodyText.includes("Effect.") ||
							bodyText.includes("yield*") ||
							bodyText.includes("Effect.gen")
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: "it-effect",
								category: "testing",
								message:
									"test() with Effects should use it.effect() from @effect/vitest",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "error",
								certainty: "potential",
								suggestion:
									"Replace test() with it.effect() for Effect-based tests",
							});
						}
					}
				}
			}

			// Detect expect().toBe/toEqual with Exit values
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const method = node.expression.name.text;
				if (
					method === "toBe" ||
					method === "toEqual" ||
					method === "toStrictEqual"
				) {
					const args = node.arguments;
					if (args.length > 0) {
						const argText = args[0].getText(sourceFile);
						if (
							argText.includes("Exit.") ||
							argText.includes("succeed") ||
							argText.includes("fail")
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: "effect-exit",
								category: "testing",
								message:
									"Exit comparisons should use Effect/Exit matchers from @effect/vitest",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "warning",
								certainty: "potential",
								suggestion:
									"Use Exit.isSuccess/isFailure or it.effect with proper assertions",
							});
						}
					}
				}
			}

			// Detect TestClock usage (reminder to use it.live when needed)
			if (
				ts.isPropertyAccessExpression(node) &&
				node.name.text === "TestClock"
			) {
				// This is informational - TestClock usage is fine with it.effect
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "test-clock",
					category: "testing",
					message:
						"TestClock detected; ensure test uses it.effect (not it.live)",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "info",
					certainty: "potential",
					suggestion:
						"it.effect provides TestClock automatically; use it.live for real time",
				});
			}

			// Detect Layer usage without it.layer
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression) &&
				node.expression.name.text === "provide"
			) {
				const args = node.arguments;
				if (args.length > 0) {
					const argText = args[0].getText(sourceFile);
					if (
						argText.includes("Layer.") ||
						argText.includes("Live") ||
						argText.includes("Test")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: "layer-test",
							category: "testing",
							message:
								"Layer provision in tests; consider it.layer for test suite setup",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Use it.layer() or describe.layer() for suite-wide layer provision",
						});
					}
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);

		// Check for missing @effect/vitest import in test files with Effects
		if (!hasEffectVitestImport && hasVitestImport) {
			const hasEffectUsage =
				sourceCode.includes("Effect.") || sourceCode.includes("yield*");
			if (hasEffectUsage) {
				violations.push({
					ruleId: "effect-vitest-imports",
					category: "testing",
					message:
						"Test file uses Effect but imports from 'vitest' instead of '@effect/vitest'",
					filePath,
					line: 1,
					column: 1,
					snippet: "import { ... } from 'vitest'",
					severity: "error",
					certainty: "potential",
					suggestion:
						"Replace 'vitest' import with '@effect/vitest' for Effect test utilities",
				});
			}
		}

		return violations;
	},
};
