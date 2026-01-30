/**
 * rule-006: switch-on-tag
 *
 * Rule: Never check ._tag directly; use Schema.is(Variant)
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "discriminated-unions",
	name: "switch-on-tag",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect switch statements on ._tag
		if (ts.isSwitchStatement(node)) {
			const expressionText = node.expression.getText(sourceFile);

			if (
				expressionText.includes("._tag") ||
				expressionText.endsWith("._tag")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"switch on ._tag should use Match.tag() for exhaustive matching",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Match.type<UnionType>().pipe(Match.tag('Tag1', ...), ...)",
				});
			}
		}

		// Detect if statements checking ._tag
		if (ts.isIfStatement(node)) {
			const conditionText = node.expression.getText(sourceFile);

			if (conditionText.includes("._tag")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "if statement checking ._tag should use Match.tag()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Match.tag() for exhaustive pattern matching",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
