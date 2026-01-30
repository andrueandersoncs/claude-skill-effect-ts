/**
 * Schema detector
 *
 * Detects patterns that should use Effect Schema
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const schemaDetector: CategoryDetector = {
	category: "schema",
	description: "Detects patterns that should use Effect Schema",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		// Track interfaces and types to suggest Schema alternatives
		const typeDefs: Array<{
			name: string;
			line: number;
			column: number;
			snippet: string;
		}> = [];

		const visit = (node: ts.Node) => {
			// Detect interface declarations (should potentially be Schema.Class)
			if (ts.isInterfaceDeclaration(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				typeDefs.push({
					name: node.name.text,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
				});

				violations.push({
					ruleId: "schema-class",
					category: "schema",
					message: `Interface '${node.name.text}' should be defined as Schema.Class for runtime validation`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: `Convert to: class ${node.name.text} extends Schema.Class<${node.name.text}>()({...})`,
				});
			}

			// Detect type aliases that could be Schema
			if (ts.isTypeAliasDeclaration(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				// Check if it's a union type (potential Schema.Union)
				if (ts.isUnionTypeNode(node.type)) {
					violations.push({
						ruleId: "schema-union",
						category: "schema",
						message: `Type alias '${node.name.text}' union should use Schema.Union`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion: "Convert to Schema.Union() for runtime validation",
					});
				}
				// Check if it's a literal type (potential Schema.Literal)
				else if (
					ts.isLiteralTypeNode(node.type) ||
					(ts.isUnionTypeNode(node.type) &&
						node.type.types.every(ts.isLiteralTypeNode))
				) {
					violations.push({
						ruleId: "schema-literal",
						category: "schema",
						message: `Type alias '${node.name.text}' with literal types should use Schema.Literal`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion: "Convert to Schema.Literal() for runtime validation",
					});
				}
				// Object types should be Schema.Struct or Schema.Class
				else if (ts.isTypeLiteralNode(node.type)) {
					violations.push({
						ruleId: "schema-class",
						category: "schema",
						message: `Type alias '${node.name.text}' should use Schema.Struct or Schema.Class`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Convert to Schema.Struct() or Schema.Class() for runtime validation",
					});
				}
			}

			// Detect JSON.parse (should use Schema.parseJson)
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (ts.isIdentifier(obj) && obj.text === "JSON" && method === "parse") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "parse-json",
						category: "schema",
						message: "JSON.parse() should be replaced with Schema.parseJson()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Use Schema.parseJson(MySchema) for type-safe JSON parsing",
					});
				}
			}

			// Detect classes extending Error (should use Schema.TaggedError)
			if (ts.isClassDeclaration(node) && node.heritageClauses) {
				for (const clause of node.heritageClauses) {
					if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
						for (const type of clause.types) {
							const typeName = type.expression.getText(sourceFile);
							if (typeName === "Error") {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: "schema-tagged-error",
									category: "schema",
									message: "Error classes should extend Schema.TaggedError",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node.getText(sourceFile).slice(0, 100),
									severity: "error",
									certainty: "definite",
									suggestion:
										"Use Schema.TaggedError('ErrorName')({ fields }) pattern",
								});
							}
						}
					}
				}
			}

			// Detect branded type patterns using 'as' (should use Schema.brand)
			if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type)) {
				const typeText = node.type.getText(sourceFile);
				// Check if it looks like a branded type (has Brand or specific naming)
				if (
					typeText.includes("Brand") ||
					typeText.endsWith("Id") ||
					typeText.endsWith("ID")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "branded-ids",
						category: "schema",
						message:
							"Branded types should use Schema.brand() for runtime validation",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "warning",
						certainty: "potential",
						suggestion: "Use Schema.String.pipe(Schema.brand('BrandName'))",
					});
				}
			}

			// Detect plain object literals with _tag property (should be Schema.TaggedClass)
			if (ts.isObjectLiteralExpression(node)) {
				const hasTag = node.properties.some(
					(prop) =>
						ts.isPropertyAssignment(prop) &&
						ts.isIdentifier(prop.name) &&
						prop.name.text === "_tag",
				);

				if (hasTag) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "tagged-union-state",
						category: "schema",
						message: "Objects with _tag should be Schema.TaggedClass instances",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion: "Define a Schema.TaggedClass and use its constructor",
					});
				}
			}

			// Detect enum declarations (should use Schema.Literal union or branded types)
			if (ts.isEnumDeclaration(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "schema-literal",
					category: "schema",
					message: `Enum '${node.name.text}' should be replaced with Schema.Literal union`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: "Convert to Schema.Literal('value1', 'value2', ...)",
				});
			}

			// Detect typeof checks (should use Schema.is)
			if (ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "schema-filters",
					category: "schema",
					message: "typeof checks should use Schema.is() type guards",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion: "Use Schema.is(MySchema) for type-safe runtime checks",
				});
			}

			// Detect instanceof checks (should use Schema.is for Schema classes)
			if (
				ts.isBinaryExpression(node) &&
				node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "schema-filters",
					category: "schema",
					message:
						"instanceof checks may be replaced with Schema.is() for Schema classes",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"If checking Schema.Class, use Schema.is(MyClass) instead",
				});
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
