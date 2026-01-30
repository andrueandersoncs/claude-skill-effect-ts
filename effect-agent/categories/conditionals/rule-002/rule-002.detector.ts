/**
 * rule-002: match-literal-union
 *
 * Rule: Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "conditionals",
	name: "match-literal-union",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const countOrConditions = (node: ts.Node): number => {
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.BarBarToken
		) {
			return 1 + countOrConditions(node.left) + countOrConditions(node.right);
		}
		return 0;
	};

	const visit = (node: ts.Node) => {
		// Detect if statements with multiple OR conditions
		if (ts.isIfStatement(node)) {
			const condition = node.expression;
			const orCount = countOrConditions(condition);

			if (orCount >= 1) {
				// Check if it's comparing against literals
				const conditionText = condition.getText(sourceFile);
				const isLiteralComparison =
					conditionText.includes("===") || conditionText.includes("==");

				if (isLiteralComparison) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Multiple OR conditions comparing literals; use Schema.Literal union with Match",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: conditionText.slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Define Schema.Union(Schema.Literal('a'), Schema.Literal('b'), ...) and use Match.when(Schema.is(union), ...)",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
