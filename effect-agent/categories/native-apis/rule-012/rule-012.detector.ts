/**
 * rule-012: reusable-pipeline
 *
 * Rule: Never use nested function calls; use flow for composing pipelines
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "native-apis",
	name: "reusable-pipeline",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect arrow functions that are compositions like (x) => f(g(h(x)))
		if (ts.isArrowFunction(node) && node.parameters.length === 1) {
			const body = node.body;

			if (ts.isCallExpression(body)) {
				// Count nesting depth
				let depth = 0;
				let current: ts.Node = body;

				while (ts.isCallExpression(current)) {
					depth++;
					if (current.arguments.length > 0) {
						current = current.arguments[0];
					} else {
						break;
					}
				}

				if (depth >= 3) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Nested function composition; use flow for reusable pipeline",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use flow(h, g, f) from effect for composable, reusable pipelines",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
