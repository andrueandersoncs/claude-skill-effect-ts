/**
 * rule-006: schema-constructor
 *
 * Rule: Never construct object literals; use Schema class constructors
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "schema",
	name: "schema-constructor",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track Schema class declarations
	const schemaClasses = new Set<string>();
	// Track type aliases and interfaces (potential domain types)
	const domainTypes = new Set<string>();

	const collectTypes = (node: ts.Node) => {
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
		// Detect object literals with type assertion to Schema class type
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
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion: `Use new ${typeText}({ ... }) or ${typeText}.make({ ... }) instead of casting`,
				});
			}
		}

		// Detect satisfies with domain types (should use Schema validation)
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
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "warning",
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
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion: `Define a Schema.Class or Schema.Struct for ${typeText} to get runtime validation`,
					});
				}
			}
		}

		// Detect variable declarations with type annotation and object literal
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
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
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
