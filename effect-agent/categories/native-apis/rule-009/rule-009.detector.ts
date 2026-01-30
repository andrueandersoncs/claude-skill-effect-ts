/**
 * rule-009: head-and-tail-access
 *
 * Rule: Never use array[index]; use Array.get or Array.head/last (returns Option)
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "native-apis",
	name: "head-and-tail-access",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect array[0] access (should use Array.head)
		if (
			ts.isElementAccessExpression(node) &&
			ts.isNumericLiteral(node.argumentExpression)
		) {
			const index = node.argumentExpression.text;
			if (index === "0") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"array[0] may return undefined; use Array.head() for Option<T>",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Array.head() which returns Option<T>",
				});
			} else if (index === "-1" || parseInt(index, 10) < 0) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Negative array index; use Array.last() for Option<T>",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Array.last() which returns Option<T>",
				});
			}
		}

		// Detect .length === 0 or .length > 0 checks
		if (
			ts.isBinaryExpression(node) &&
			ts.isPropertyAccessExpression(node.left) &&
			node.left.name.text === "length"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					".length comparison should use Array.isEmptyArray() or Array.match()",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile),
				severity: "warning",
				certainty: "potential",
				suggestion:
					"Use Array.isEmptyArray() or Array.isNonEmptyArray() predicates",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
