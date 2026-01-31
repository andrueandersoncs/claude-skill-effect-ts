/**
 * rule-004: data-transformation-pipeline
 *
 * Rule: Never use native method chaining; use pipe with Effect's Array module
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "native-apis",
	name: "data-transformation-pipeline",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect chained native array methods
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;
			const nativeArrayMethods = [
				"map",
				"filter",
				"reduce",
				"find",
				"some",
				"every",
				"flatMap",
			];

			if (nativeArrayMethods.includes(method)) {
				// Check for method chaining
				let chainLength = 0;
				let current: ts.Node = node;

				while (
					ts.isCallExpression(current) &&
					ts.isPropertyAccessExpression(current.expression)
				) {
					const m = current.expression.name.text;
					if (nativeArrayMethods.includes(m)) {
						chainLength++;
					}
					current = current.expression.expression;
				}

				if (chainLength >= 2) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Chained native array methods; use pipe with Effect Array module",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use pipe(array, Array.map(...), Array.filter(...)) from effect for better composition",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
