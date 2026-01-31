/**
 * rule-003: converting-to-entries
 *
 * Rule: Never use Object.keys/values/entries; use Record module
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "native-apis",
	name: "converting-to-entries",
};

const objectMethods: Record<string, { message: string; suggestion: string }> = {
	keys: {
		message: "Object.keys() should be replaced with Record.keys()",
		suggestion: "Use Record.keys() from effect",
	},
	values: {
		message: "Object.values() should be replaced with Record.values()",
		suggestion: "Use Record.values() from effect",
	},
	entries: {
		message: "Object.entries() should be replaced with Record.toEntries()",
		suggestion: "Use Record.toEntries() from effect",
	},
	fromEntries: {
		message:
			"Object.fromEntries() should be replaced with Record.fromEntries()",
		suggestion: "Use Record.fromEntries() from effect",
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
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Object") {
				const replacement = objectMethods[method];
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
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "definite",
						suggestion: replacement.suggestion,
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
