/**
 * rule-002: building-object-mutation
 *
 * Rule: Never reassign variables; use functional transformation
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "imperative",
	name: "building-object-mutation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect let declarations (potential mutation)
		if (ts.isVariableStatement(node)) {
			const declarationList = node.declarationList;
			if (declarationList.flags & ts.NodeFlags.Let) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Prefer const over let; use immutable patterns or Ref for mutable state",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use const with immutable operations, or Effect Ref for state",
				});
			}
		}

		// Detect mutation operators (++, --)
		if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
			const operator = node.operator;
			if (
				operator === ts.SyntaxKind.PlusPlusToken ||
				operator === ts.SyntaxKind.MinusMinusToken
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Mutation operators (++/--) violate immutability",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "error",
					certainty: "definite",
					suggestion: "Use immutable operations or Ref.update()",
				});
			}
		}

		// Detect compound assignment operators
		if (ts.isBinaryExpression(node)) {
			const operator = node.operatorToken.kind;
			const mutationOperators = [
				ts.SyntaxKind.PlusEqualsToken,
				ts.SyntaxKind.MinusEqualsToken,
				ts.SyntaxKind.AsteriskEqualsToken,
				ts.SyntaxKind.SlashEqualsToken,
				ts.SyntaxKind.PercentEqualsToken,
				ts.SyntaxKind.AmpersandEqualsToken,
				ts.SyntaxKind.BarEqualsToken,
				ts.SyntaxKind.CaretEqualsToken,
			];

			if (mutationOperators.includes(operator)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Compound assignment operators violate immutability",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "error",
					certainty: "definite",
					suggestion: "Use immutable operations or Ref.update()",
				});
			}

			// Detect indexed/property assignment (obj[key] = value or obj.prop = value)
			if (operator === ts.SyntaxKind.EqualsToken) {
				const left = node.left;
				// Check for indexed assignment: obj[key] = value
				if (ts.isElementAccessExpression(left)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Indexed assignment mutates object; use immutable patterns",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Record.set or spread syntax to create new object: { ...obj, [key]: value }",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
