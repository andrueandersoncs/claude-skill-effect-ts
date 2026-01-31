/**
 * rule-001: branded-ids
 *
 * Rule: Never use raw primitives for IDs; use Schema.brand
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "schema",
	name: "branded-ids",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
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
					ruleId: meta.id,
					category: meta.category,
					message:
						"Branded types should use Schema.brand() for runtime validation",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Schema.String.pipe(Schema.brand('BrandName'))",
				});
			}
		}

		// Detect Schema.Struct with id field using plain Schema.String
		if (ts.isCallExpression(node)) {
			const callText = node.expression.getText(sourceFile);
			if (callText === "Schema.Struct" && node.arguments.length > 0) {
				const arg = node.arguments[0];
				if (ts.isObjectLiteralExpression(arg)) {
					for (const prop of arg.properties) {
						if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
							const propName = prop.name.text.toLowerCase();
							// Check if this looks like an ID field
							if (propName === "id" || propName.endsWith("id")) {
								const valueText = prop.initializer.getText(sourceFile);
								// Check if using plain Schema.String or Schema.Number without brand
								if (
									(valueText === "Schema.String" ||
										valueText === "Schema.Number") &&
									!valueText.includes("brand")
								) {
									const { line, character } =
										sourceFile.getLineAndCharacterOfPosition(prop.getStart());
									violations.push({
										ruleId: meta.id,
										category: meta.category,
										message: `ID field '${prop.name.text}' uses raw primitive; should use Schema.brand`,
										filePath,
										line: line + 1,
										column: character + 1,
										snippet: prop.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
										severity: "warning",
										certainty: "potential",
										suggestion:
											"Use Schema.String.pipe(Schema.brand('UserId')) for type-safe IDs",
									});
								}
							}
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
