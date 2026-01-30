/**
 * Conditionals detector
 *
 * Detects if/else, switch/case, and ternary operators
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const conditionalsDetector: CategoryDetector = {
	category: "conditionals",
	description: "Detects if/else, switch/case, and ternary operators",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect if statements
			if (ts.isIfStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				// Check for common patterns that should use Match or Option
				const conditionText = node.expression.getText(sourceFile);
				let suggestion = "Replace with Match.value() + Match.when() patterns";
				let ruleId = "switch-to-match-tag";

				// Detect null/undefined checks
				if (
					conditionText.includes("!= null") ||
					conditionText.includes("!== null") ||
					conditionText.includes("!= undefined") ||
					conditionText.includes("!== undefined") ||
					conditionText.includes("== null") ||
					conditionText.includes("=== null")
				) {
					ruleId = "nullable-option-match";
					suggestion = "Use Option.match() for nullable handling";
				}

				// Detect ._tag checks
				if (conditionText.includes("._tag")) {
					ruleId = "switch-to-match-tag";
					suggestion = "Use Match.tag() for discriminated unions";
				}

				// Detect .length checks
				if (conditionText.includes(".length")) {
					ruleId = "array-empty-check";
					suggestion = "Use Array.match() or Array.isEmptyArray()";
				}

				violations.push({
					ruleId,
					category: "conditionals",
					message: "Use Match module instead of if/else statements",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion,
				});
			}

			// Detect switch statements
			if (ts.isSwitchStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				const expressionText = node.expression.getText(sourceFile);
				let suggestion = "Replace with Match.value() + Match.when()";
				const ruleId = "switch-to-match-tag";

				// Check if switching on ._tag
				if (expressionText.includes("._tag")) {
					suggestion = "Replace with Match.tag() for exhaustive matching";
				}

				violations.push({
					ruleId,
					category: "conditionals",
					message: "Use Match module instead of switch statements",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion,
				});
			}

			// Detect ternary operators
			if (ts.isConditionalExpression(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				const conditionText = node.condition.getText(sourceFile);
				let suggestion = "Replace with Match.value() + Match.when() or pipe";
				let ruleId = "ternary-to-match";

				// Check for specific patterns
				if (
					conditionText.includes("!= null") ||
					conditionText.includes("!== null") ||
					conditionText.includes("== null") ||
					conditionText.includes("=== null")
				) {
					suggestion = "Use Option.match() or Option.getOrElse()";
					ruleId = "nullable-option-match";
				}

				violations.push({
					ruleId,
					category: "conditionals",
					message: "Use Match module or Option instead of ternary operators",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion,
				});
			}

			// Detect direct ._tag access (potential violation - should use Match.tag)
			if (ts.isPropertyAccessExpression(node) && node.name.text === "_tag") {
				// Skip if it's within a type/interface declaration
				let parent = node.parent;
				let isInTypeContext = false;
				while (parent) {
					if (
						ts.isTypeAliasDeclaration(parent) ||
						ts.isInterfaceDeclaration(parent) ||
						ts.isTypeLiteralNode(parent)
					) {
						isInTypeContext = true;
						break;
					}
					parent = parent.parent;
				}

				if (!isInTypeContext) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "switch-to-match-tag",
						category: "conditionals",
						message: "Direct ._tag access; prefer Match.tag() or Schema.is()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Match.tag() for pattern matching on discriminated unions",
					});
				}
			}

			// Detect || and && used for conditionals (not in boolean context)
			if (ts.isBinaryExpression(node)) {
				const operator = node.operatorToken.kind;
				if (
					operator === ts.SyntaxKind.BarBarToken ||
					operator === ts.SyntaxKind.AmpersandAmpersandToken
				) {
					// Check if this is being used for short-circuit evaluation (value coalescing)
					const parent = node.parent;
					if (
						parent &&
						(ts.isVariableDeclaration(parent) ||
							ts.isReturnStatement(parent) ||
							ts.isPropertyAssignment(parent) ||
							ts.isCallExpression(parent))
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: "multi-condition-matching",
							category: "conditionals",
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

			// Detect nullish coalescing (??) - potential Option.getOrElse candidate
			if (ts.isBinaryExpression(node)) {
				const operator = node.operatorToken.kind;
				if (operator === ts.SyntaxKind.QuestionQuestionToken) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "nullable-option-match",
						category: "conditionals",
						message: "Nullish coalescing (??) can be replaced with Option",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "info",
						certainty: "potential",
						suggestion: "Consider Option.fromNullable() + Option.getOrElse()",
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
