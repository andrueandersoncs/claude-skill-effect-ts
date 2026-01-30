/**
 * rule-006: effect-gen-multi-step
 *
 * Rule: Use Effect.gen() for multi-step sequential operations
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "code-style",
	name: "effect-gen-multi-step",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect chained .pipe/.flatMap/.andThen that could be Effect.gen
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;

			if (method === "flatMap" || method === "andThen" || method === "tap") {
				// Count chain depth
				let chainDepth = 0;
				let current: ts.Node = node;

				while (
					ts.isCallExpression(current) &&
					ts.isPropertyAccessExpression(current.expression)
				) {
					const m = current.expression.name.text;
					if (
						m === "flatMap" ||
						m === "andThen" ||
						m === "tap" ||
						m === "map"
					) {
						chainDepth++;
					}
					current = current.expression.expression;
				}

				if (chainDepth >= 3) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Long Effect chain; consider Effect.gen() for readability",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Effect.gen(function* () { const a = yield* step1; const b = yield* step2; ... }) for multi-step operations",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
