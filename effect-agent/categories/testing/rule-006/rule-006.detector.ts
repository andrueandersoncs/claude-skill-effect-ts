/**
 * rule-006: property-based-testing
 *
 * Rule: Use property-based testing with Schema: it.prop, it.effect.prop, and Arbitrary.make
 *
 * This consolidated detector checks for:
 * - Stubbed methods as "not implemented" (from rule-001)
 * - Hardcoded values in test layers (from rule-002)
 * - Raw fast-check arbitraries (from rule-009)
 * - Manual fc.assert/fc.property usage (from rule-013)
 * - layer() without property-based tests (from rule-011)
 * - Hardcoded test data with forEach patterns (from rule-006)
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "testing",
	name: "property-based-testing",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files (and .bad.ts for testing the detector)
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const fullText = sourceFile.getFullText();

	// === Check 1: layer() without property-based tests (from rule-011) ===
	const hasDescribeLayer =
		fullText.includes("describe.layer") ||
		fullText.includes("it.layer") ||
		/\blayer\s*\(/.test(fullText);
	const hasPropertyTests =
		fullText.includes("it.prop") ||
		fullText.includes("it.effect.prop") ||
		fullText.includes(".prop(");

	if (hasDescribeLayer && !hasPropertyTests) {
		violations.push({
			ruleId: meta.id,
			category: meta.category,
			message:
				"Test suite uses layer() but no property-based tests; consider it.effect.prop for fuller coverage",
			filePath,
			line: 1,
			column: 1,
			snippet: "layer() without property-based tests",
			certainty: "potential",
			suggestion:
				"Combine layer() with it.effect.prop() for comprehensive integration testing with generated data",
		});
	}

	const visit = (node: ts.Node) => {
		// === Check 2: throw new Error("not implemented") patterns (from rule-001) ===
		if (ts.isThrowStatement(node) && node.expression) {
			const throwText = node.expression.getText(sourceFile).toLowerCase();
			if (
				throwText.includes("not implemented") ||
				throwText.includes("not yet implemented") ||
				throwText.includes("todo") ||
				throwText.includes("stub")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Stub with 'not implemented'; use Arbitrary-generated responses",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion:
						"Use Arbitrary.make(Schema) to generate test responses: Effect.succeed(pipe(fc.sample(arb, 1), Array.head, Option.getOrThrow))",
				});
			}
		}

		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			// === Check 3: Effect.die/fail("not implemented") patterns (from rule-001) ===
			if (
				ts.isIdentifier(obj) &&
				obj.text === "Effect" &&
				(method === "die" || method === "fail")
			) {
				if (node.arguments.length > 0) {
					const argText = node.arguments[0].getText(sourceFile).toLowerCase();
					if (
						argText.includes("not implemented") ||
						argText.includes("stub") ||
						argText.includes("todo")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Effect stub with 'not implemented'; use Arbitrary-generated responses",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion:
								"Generate proper test data with Arbitrary.make(Schema) instead of stubbing",
						});
					}
				}
			}

			// === Check 4: Raw fast-check arbitraries fc.integer, fc.string, etc. (from rule-009) ===
			if (ts.isIdentifier(obj) && obj.text === "fc") {
				const rawArbitraries = [
					"integer",
					"nat",
					"string",
					"boolean",
					"date",
					"array",
					"object",
					"record",
					"tuple",
					"float",
					"double",
				];

				if (rawArbitraries.includes(method)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `fc.${method}() - use Schema with it.prop instead of raw fast-check`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "definite",
						suggestion:
							"Use it.prop({ value: Schema.Number }) or it.effect.prop({ value: Schema.String }) with Schema-defined types",
					});
				}

				// === Check 5: fc.assert and fc.property (from rule-013) ===
				if (method === "assert" || method === "property") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `fc.${method}() - use it.prop or it.effect.prop instead`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "definite",
						suggestion:
							"Use it.effect.prop({ schema: MySchema }, ({ schema }) => Effect.gen(...)) from @effect/vitest",
					});
				}
			}

			// === Check 6: Layer.succeed with hardcoded object literals (from rule-002) ===
			if (
				ts.isIdentifier(obj) &&
				obj.text === "Layer" &&
				method === "succeed"
			) {
				if (node.arguments.length >= 2) {
					const serviceImpl = node.arguments[1];
					if (ts.isObjectLiteralExpression(serviceImpl)) {
						const implText = serviceImpl.getText(sourceFile);
						if (
							implText.includes("Effect.succeed") &&
							/Effect\.succeed\s*\(\s*\{[^}]*["'][^"']+["'][^}]*\}/.test(
								implText,
							)
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Test Layer uses hardcoded values; use Arbitrary-generated values",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								certainty: "potential",
								suggestion:
									"Use Layer.effect with Arbitrary.make(Schema): Effect.succeed(pipe(fc.sample(arb, 1), Array.head, Option.getOrThrow))",
							});
						}
					}
				}
			}

			// === Check 7: forEach with hardcoded test data arrays (from rule-006 original) ===
			if (ts.isIdentifier(obj) && method === "forEach") {
				const objName = obj.text.toLowerCase();
				if (
					objName.includes("test") ||
					objName.includes("order") ||
					objName.includes("mock") ||
					objName.includes("fixture") ||
					objName.includes("sample") ||
					objName.includes("data")
				) {
					if (node.arguments.length >= 1) {
						const callback = node.arguments[0];
						if (
							ts.isArrowFunction(callback) ||
							ts.isFunctionExpression(callback)
						) {
							const bodyText = callback.getText(sourceFile);
							if (bodyText.includes("it(") || bodyText.includes("it(`")) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: meta.id,
									category: meta.category,
									message:
										"forEach with hardcoded test data; use it.effect.prop for property-based testing",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node
										.getText(sourceFile)
										.slice(0, SNIPPET_MAX_LENGTH),
									certainty: "potential",
									suggestion:
										"Use it.effect.prop({ data: Schema }, ({ data }) => Effect.gen(...)) for generated test data",
								});
							}
						}
					}
				}
			}

			// === Check 8: it.effect with hardcoded data patterns (from rule-006 original) ===
			if (ts.isIdentifier(obj) && obj.text === "it" && method === "effect") {
				if (node.arguments.length >= 2) {
					const callback = node.arguments[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);
						const hasHardcodedArray = /\[\s*["'`\d].*,.*,.*\]/.test(bodyText);
						const hasHardcodedObject = /\{\s*\w+:\s*["'`\d].*,.*\}/.test(
							bodyText,
						);

						if (hasHardcodedArray || hasHardcodedObject) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"it.effect with hardcoded test data; consider it.effect.prop for property-based testing",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								certainty: "potential",
								suggestion:
									"Use it.effect.prop({ data: Schema }, ({ data }) => Effect.gen(...)) for generated test data",
							});
						}
					}
				}
			}
		}

		// === Check 9: Manual test data arrays (from rule-002) ===
		if (ts.isArrayLiteralExpression(node)) {
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
							ruleId: meta.id,
							category: meta.category,
							message:
								"Manual test data arrays should use Arbitrary.make(Schema)",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use Arbitrary.make(YourSchema) to generate test data from schemas",
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
