/**
 * rule-004: parallel-results
 *
 * Rule: Never use Promise.all; use Effect.all
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "async",
	name: "parallel-results",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Promise.all, Promise.allSettled
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Promise") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				if (method === "all") {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Promise.all() should be replaced with Effect.all()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Effect.all()",
					});
				} else if (method === "allSettled") {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Promise.allSettled() should be replaced with Effect.all({ mode: 'either' })",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Effect.all({ mode: 'either' })",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
