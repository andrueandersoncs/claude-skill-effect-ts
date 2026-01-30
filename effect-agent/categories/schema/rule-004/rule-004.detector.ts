/**
 * rule-004: schema-class-methods
 *
 * Rule: Never use Schema.Struct for entities with methods; use Schema.Class
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "schema",
	name: "schema-class-methods",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track Schema.Struct declarations and their derived types
	const schemaStructs = new Map<string, ts.Node>();

	// First pass: collect Schema.Struct declarations
	const collectStructs = (node: ts.Node) => {
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const initText = node.initializer.getText(sourceFile);
			if (initText.includes("Schema.Struct")) {
				const varName = node.name.getText(sourceFile);
				schemaStructs.set(varName, node);
			}
		}
		ts.forEachChild(node, collectStructs);
	};
	collectStructs(sourceFile);

	const visit = (node: ts.Node) => {
		// Detect Schema.Struct followed by manually adding methods
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const initText = node.initializer.getText(sourceFile);

			// Check if it's a Schema.Struct
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
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { methods() { ... } }",
						});
						break;
					}
				}
			}
		}

		// Detect functions that operate on Schema.Struct types (should be methods)
		if (ts.isFunctionDeclaration(node) && node.parameters.length > 0) {
			const firstParam = node.parameters[0];
			if (firstParam.type) {
				const typeText = firstParam.type.getText(sourceFile);
				// Check if the parameter type matches a Schema.Struct
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
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { method() { ... } }",
					});
				}
			}
		}

		// Detect arrow functions/const functions that operate on Schema.Struct types
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
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "warning",
								certainty: "potential",
								suggestion:
									"Use class Entity extends Schema.Class<Entity>('Entity')({ ... }) { method() { ... } }",
							});
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
