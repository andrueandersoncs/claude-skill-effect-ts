/**
 * rule-001: array-empty-check
 *
 * Rule: Never use array empty checks; use Array.match
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "conditionals",
	name: "array-empty-check",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect if statements with .length checks
		if (ts.isIfStatement(node)) {
			const conditionText = node.expression.getText(sourceFile);

			if (conditionText.includes(".length")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Array length check should use Array.match or Array.isEmptyArray",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 150),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Array.match() or Array.isEmptyArray()",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
