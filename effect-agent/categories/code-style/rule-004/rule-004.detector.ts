/**
 * rule-004: effect-fn-single-step
 *
 * Rule: Never use Effect.gen for simple single-step effects; use Effect.fn()
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "code-style",
	name: "effect-fn-single-step",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Effect.gen with a single yield*
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Effect" && method === "gen") {
				if (node.arguments.length > 0) {
					const genFn = node.arguments[0];
					if (ts.isFunctionExpression(genFn) || ts.isArrowFunction(genFn)) {
						const bodyText = genFn.getText(sourceFile);

						// Count yield* statements
						const yieldCount = (bodyText.match(/yield\*/g) || []).length;

						// If only one yield* and it's essentially the entire body
						if (yieldCount === 1) {
							// Check if the body is simple (just a yield and maybe a return)
							const lines = bodyText.split("\n").filter((l) => l.trim());
							if (lines.length <= 4) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: meta.id,
									category: meta.category,
									message:
										"Effect.gen with single yield*; consider Effect.fn() for simpler code",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node.getText(sourceFile).slice(0, 80),
									severity: "info",
									certainty: "potential",
									suggestion:
										"Use Effect.fn('name')((...args) => singleEffect) for single-step operations",
								});
							}
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
