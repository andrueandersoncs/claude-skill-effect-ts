/**
 * rule-014: struct-predicate
 *
 * Rule: Never use manual &&/|| for predicates; use Predicate.and/or/not
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "native-apis",
	name: "struct-predicate",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Count how many && or || are in a binary expression tree
	const countLogicalOperators = (node: ts.Node): number => {
		if (!ts.isBinaryExpression(node)) return 0;
		const op = node.operatorToken.kind;
		if (
			op === ts.SyntaxKind.AmpersandAmpersandToken ||
			op === ts.SyntaxKind.BarBarToken
		) {
			return (
				1 + countLogicalOperators(node.left) + countLogicalOperators(node.right)
			);
		}
		return 0;
	};

	const visit = (node: ts.Node) => {
		// Detect arrow functions that return boolean and use multiple && or ||
		if (ts.isArrowFunction(node)) {
			const body = node.body;

			if (ts.isBinaryExpression(body)) {
				const logicalOpCount = countLogicalOperators(body);

				// If there are 3+ logical operators, this is a complex predicate
				// that could benefit from Predicate.and/or composition
				if (logicalOpCount >= 3) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Complex predicate with multiple &&/||; use Predicate.and/or/not",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Predicate.and/or/not for composable, reusable predicates",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
