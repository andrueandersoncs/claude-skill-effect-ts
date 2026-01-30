/**
 * rule-007: numeric-classification
 *
 * Rule: Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "conditionals",
	name: "numeric-classification",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect if statements with negated conditions at the start
		if (ts.isIfStatement(node)) {
			const condition = node.expression;

			// Check for leading negation (!)
			if (ts.isPrefixUnaryExpression(condition)) {
				if (condition.operator === ts.SyntaxKind.ExclamationToken) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Negated condition in if statement; prefer positive conditions with Match",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: condition.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Define positive Schema types for each case and use Match.when with Schema.is",
					});
				}
			}

			// Check for numeric comparisons that could be classified
			const condText = condition.getText(sourceFile);
			if (
				(condText.includes("<") ||
					condText.includes(">") ||
					condText.includes("<=") ||
					condText.includes(">=")) &&
				node.elseStatement &&
				ts.isIfStatement(node.elseStatement)
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Numeric range classification with if/else chain; use Schema with Match",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: condText.slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Define Schema.Number.pipe(Schema.filter(n => ...)) for each range and use Match.when(Schema.is(range), ...)",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
