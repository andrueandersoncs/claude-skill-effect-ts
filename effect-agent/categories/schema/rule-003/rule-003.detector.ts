/**
 * rule-003: parse-json
 *
 * Rule: Never use JSON.parse(); use Schema.parseJson()
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "schema",
	name: "parse-json",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect JSON.parse (should use Schema.parseJson)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "JSON" && method === "parse") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "JSON.parse() should be replaced with Schema.parseJson()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion:
						"Use Schema.parseJson(MySchema) for type-safe JSON parsing",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
