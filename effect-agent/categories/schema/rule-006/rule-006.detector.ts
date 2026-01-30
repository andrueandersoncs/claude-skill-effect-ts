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

	const collectSchemaClasses = (node: ts.Node) => {
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
		ts.forEachChild(node, collectSchemaClasses);
	};

	collectSchemaClasses(sourceFile);

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

		// Detect satisfies with Schema types
		if (ts.isSatisfiesExpression(node)) {
			const typeText = node.type.getText(sourceFile);
			if (
				ts.isObjectLiteralExpression(node.expression) &&
				schemaClasses.has(typeText)
			) {
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
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
