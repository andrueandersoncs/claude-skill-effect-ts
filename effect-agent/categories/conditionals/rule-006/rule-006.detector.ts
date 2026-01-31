/**
 * rule-006: nullable-option-match
 *
 * Rule: Never use null checks (if x != null); use Option.match
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "conditionals",
	name: "nullable-option-match",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect if statements with null/undefined checks
		if (ts.isIfStatement(node)) {
			const conditionText = node.expression.getText(sourceFile);

			if (
				conditionText.includes("!= null") ||
				conditionText.includes("!== null") ||
				conditionText.includes("!= undefined") ||
				conditionText.includes("!== undefined") ||
				conditionText.includes("== null") ||
				conditionText.includes("=== null") ||
				conditionText.includes("== undefined") ||
				conditionText.includes("=== undefined")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Null/undefined checks should use Option.match",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion: "Use Option.match() for nullable handling",
				});
			}
		}

		// Detect ternary with null checks
		if (ts.isConditionalExpression(node)) {
			const conditionText = node.condition.getText(sourceFile);

			if (
				conditionText.includes("!= null") ||
				conditionText.includes("!== null") ||
				conditionText.includes("== null") ||
				conditionText.includes("=== null") ||
				conditionText.includes("!= undefined") ||
				conditionText.includes("!== undefined")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Null check ternary should use Option.match or Option.getOrElse",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion: "Use Option.match() or Option.getOrElse()",
				});
			}
		}

		// Detect nullish coalescing (??)
		if (ts.isBinaryExpression(node)) {
			const operator = node.operatorToken.kind;
			if (operator === ts.SyntaxKind.QuestionQuestionToken) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Nullish coalescing (??) can be replaced with Option",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion: "Consider Option.fromNullable() + Option.getOrElse()",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
