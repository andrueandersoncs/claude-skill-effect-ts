/**
 * rule-006: finding-with-default
 *
 * Rule: Never use array.find(); use Array.findFirst (returns Option)
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "native-apis",
	name: "finding-with-default",
};

const arrayMethods: Record<string, { message: string; suggestion: string }> = {
	find: {
		message:
			"Array.find() returns undefined; use Array.findFirst() with Option",
		suggestion: "Use Array.findFirst() which returns Option<T>",
	},
	findIndex: {
		message:
			"Array.findIndex() returns -1; use Array.findFirstIndex() with Option",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
	includes: {
		message: "Consider Array.contains() or Array.containsWith() from Effect",
		suggestion: "Use Array.contains() from effect",
	},
	indexOf: {
		message: "Array.indexOf() returns -1; use Array.findFirstIndex()",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;
			const replacement = arrayMethods[method];

			if (replacement) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: replacement.message,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "info",
					certainty: "potential",
					suggestion: replacement.suggestion,
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
