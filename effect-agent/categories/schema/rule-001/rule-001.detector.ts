/**
 * rule-001: branded-ids
 *
 * Rule: Never use raw primitives for IDs; use Schema.brand
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

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
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Schema.String.pipe(Schema.brand('BrandName'))",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
