/**
 * rule-005: schema-class
 *
 * Comprehensive rule for proper Schema.Class usage:
 * 1. Never use TypeScript type or interface for data structures
 * 2. Never use Schema.Struct for entities with methods
 * 3. Never construct object literals; use Schema class constructors
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "schema",
	name: "schema-class",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track Schema.Struct declarations and their derived types
	const schemaStructs = new Map<string, ts.Node>();
	// Track Schema.Class declarations
	const schemaClasses = new Set<string>();
	// Track type aliases and interfaces (potential domain types)
	const domainTypes = new Set<string>();

	// First pass: collect all type declarations
	const collectTypes = (node: ts.Node) => {
		// Collect Schema.Struct declarations
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const initText = node.initializer.getText(sourceFile);
			if (initText.includes("Schema.Struct")) {
				const varName = node.name.getText(sourceFile);
				schemaStructs.set(varName, node);
			}
		}

		// Detect Schema.Class declarations
		if (ts.isClassDeclaration(node) && node.name) {
			const heritage = node.heritageClauses;
			if (heritage) {
				for (const clause of heritage) {
					const clauseText = clause.getText(sourceFile);
					if (clauseText.includes("Schema.Class")) {
						schemaClasses.add(node.name.text);
					}
				}
			}
		}

		// Track type aliases
		if (ts.isTypeAliasDeclaration(node)) {
			domainTypes.add(node.name.text);
		}

		// Track interfaces
		if (ts.isInterfaceDeclaration(node)) {
			domainTypes.add(node.name.text);
		}

		ts.forEachChild(node, collectTypes);
	};
	collectTypes(sourceFile);

	const visit = (node: ts.Node) => {
		// ===== Detection 1: TypeScript interfaces should be Schema.Class =====
		if (ts.isInterfaceDeclaration(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Interface '${node.name.text}' should be defined as Schema.Class for runtime validation`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "potential",
				suggestion: `Convert to: class ${node.name.text} extends Schema.Class<${node.name.text}>()({...})`,
			});
		}

		// ===== Detection 2: Type aliases with object types should be Schema.Class =====
		if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Type alias '${node.name.text}' should use Schema.Struct or Schema.Class`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "potential",
				suggestion:
					"Convert to Schema.Struct() or Schema.Class() for runtime validation",
			});
		}

		// ===== Detection 3: Schema.Struct with methods added separately =====
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const initText = node.initializer.getText(sourceFile);

			if (initText.includes("Schema.Struct")) {
				const varName = node.name.getText(sourceFile);

				// Look for patterns that suggest methods are being added elsewhere
				const fullText = sourceFile.getFullText();
				const methodPatterns = [
					new RegExp(`${varName}\\s*\\.\\s*prototype\\s*\\.`),
					new RegExp(`interface\\s+${varName}\\s*\\{[^}]*\\([^)]*\\)`),
				];

				for (const pattern of methodPatterns) {
					if (pattern.test(fullText)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Schema.Struct with methods added separately; use Schema.Class",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { methods() { ... } }",
						});
						break;
					}
				}
			}
		}

		// ===== Detection 4: Functions operating on Schema.Struct types =====
		if (ts.isFunctionDeclaration(node) && node.parameters.length > 0) {
			const firstParam = node.parameters[0];
			if (firstParam.type) {
				const typeText = firstParam.type.getText(sourceFile);
				if (schemaStructs.has(typeText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Function operates on Schema.Struct type '${typeText}'; consider using Schema.Class with methods`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion:
							"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { method() { ... } }",
					});
				}
			}
		}

		// ===== Detection 5: Arrow/const functions operating on Schema.Struct types =====
		if (ts.isVariableDeclaration(node) && node.initializer) {
			if (
				ts.isArrowFunction(node.initializer) ||
				ts.isFunctionExpression(node.initializer)
			) {
				const fn = node.initializer;
				if (fn.parameters.length > 0) {
					const firstParam = fn.parameters[0];
					if (firstParam.type) {
						const typeText = firstParam.type.getText(sourceFile);
						if (schemaStructs.has(typeText)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message: `Function operates on Schema.Struct type '${typeText}'; consider using Schema.Class with methods`,
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								certainty: "potential",
								suggestion:
									"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { method() { ... } }",
							});
						}
					}
				}
			}
		}

		// ===== Detection 6: Object literals cast as Schema class type =====
		if (ts.isAsExpression(node)) {
			const typeText = node.type.getText(sourceFile);
			if (
				schemaClasses.has(typeText) &&
				ts.isObjectLiteralExpression(node.expression)
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Object literal cast as ${typeText}; use Schema class constructor`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion: `Use new ${typeText}({ ... }) or ${typeText}.make({ ... }) instead of casting`,
				});
			}
		}

		// ===== Detection 7: satisfies with Schema classes =====
		if (ts.isSatisfiesExpression(node)) {
			const typeText = node.type.getText(sourceFile);
			if (ts.isObjectLiteralExpression(node.expression)) {
				if (schemaClasses.has(typeText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Object literal satisfies ${typeText}; use Schema class constructor`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion: `Use new ${typeText}({ ... }) for validation and branded type creation`,
					});
				} else if (domainTypes.has(typeText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Object literal satisfies ${typeText}; consider using Schema for runtime validation`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion: `Define a Schema.Class or Schema.Struct for ${typeText} to get runtime validation`,
					});
				}
			}
		}

		// ===== Detection 8: Variable declarations with type annotation and object literal =====
		if (ts.isVariableDeclaration(node) && node.type && node.initializer) {
			if (ts.isObjectLiteralExpression(node.initializer)) {
				const typeText = node.type.getText(sourceFile);
				if (domainTypes.has(typeText) && !schemaClasses.has(typeText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Object literal typed as ${typeText}; consider using Schema for runtime validation`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion: `Define a Schema.Class for ${typeText} and use new ${typeText}({ ... })`,
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
