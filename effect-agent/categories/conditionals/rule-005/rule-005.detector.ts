/**
 * rule-005: multi-condition-matching
 *
 * Rule: Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "conditionals",
	name: "multi-condition-matching",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect if statements (general case for if/else chains)
		if (ts.isIfStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			const conditionText = node.expression.getText(sourceFile);

			// Skip null checks (handled by rule-006)
			if (
				conditionText.includes("!= null") ||
				conditionText.includes("!== null") ||
				conditionText.includes("!= undefined") ||
				conditionText.includes("!== undefined") ||
				conditionText.includes("== null") ||
				conditionText.includes("=== null")
			) {
				ts.forEachChild(node, visit);
				return;
			}

			// Skip .length checks (handled by rule-001)
			if (conditionText.includes(".length")) {
				ts.forEachChild(node, visit);
				return;
			}

			// Skip ._tag checks (handled by rule-009)
			if (conditionText.includes("._tag")) {
				ts.forEachChild(node, visit);
				return;
			}

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Use Match module instead of if/else statements",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 150),
				severity: "error",
				certainty: "definite",
				suggestion: "Replace with Match.value() + Match.when() patterns",
			});
		}

		// Detect ||/&& short-circuit evaluation in value context
		if (ts.isBinaryExpression(node)) {
			const operator = node.operatorToken.kind;
			if (
				operator === ts.SyntaxKind.BarBarToken ||
				operator === ts.SyntaxKind.AmpersandAmpersandToken
			) {
				const parent = node.parent;
				if (
					parent &&
					(ts.isVariableDeclaration(parent) ||
						ts.isReturnStatement(parent) ||
						ts.isPropertyAssignment(parent) ||
						ts.isCallExpression(parent))
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Short-circuit evaluation may be clearer with Match or Option",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Consider Match.value() or Option.getOrElse() for clarity",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
