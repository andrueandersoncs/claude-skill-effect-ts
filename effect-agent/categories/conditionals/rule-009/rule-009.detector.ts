/**
 * rule-009: switch-to-match-tag
 *
 * Rule: Never use switch/case statements; use Match.type with Match.tag for discriminated unions
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "conditionals",
	name: "switch-to-match-tag",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect switch statements
		if (ts.isSwitchStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			const expressionText = node.expression.getText(sourceFile);
			let suggestion = "Replace with Match.value() + Match.when()";

			// Check if switching on ._tag
			if (expressionText.includes("._tag")) {
				suggestion = "Replace with Match.tag() for exhaustive matching";
			}

			violations.push({
				ruleId: meta.id,
				category: meta.category,
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

		// Detect if statements with ._tag checks
		if (ts.isIfStatement(node)) {
			const conditionText = node.expression.getText(sourceFile);

			if (conditionText.includes("._tag")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Tag-based conditionals should use Match.tag()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Match.tag() for discriminated unions",
				});
			}
		}

		// Detect direct ._tag access (potential violation)
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
					ruleId: meta.id,
					category: meta.category,
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

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
