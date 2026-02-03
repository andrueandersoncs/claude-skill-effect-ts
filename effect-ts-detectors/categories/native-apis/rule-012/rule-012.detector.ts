/**
 * rule-012: reusable-pipeline
 *
 * Rule: Never use nested function calls; use flow for composing pipelines
 */

import * as ts from "typescript";
import {
	NativeApisViolation,
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../src/types.js";

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
		// Detect arrow functions with chained method calls like arr.filter().map()
		if (ts.isArrowFunction(node) && node.parameters.length === 1) {
			const body = node.body;

			// Check for method chaining pattern: x.method1().method2()...
			if (ts.isCallExpression(body)) {
				let chainDepth = 0;
				let current: ts.Node = body;

				// Count chain depth by following property access expressions
				while (ts.isCallExpression(current)) {
					chainDepth++;
					const expr = current.expression;
					if (ts.isPropertyAccessExpression(expr)) {
						current = expr.expression;
					} else {
						break;
					}
				}

				// If we have 2+ chained methods, suggest using flow/pipe
				if (chainDepth >= 2) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push(
						new NativeApisViolation({
							category: "native-apis",
							ruleId: meta.id,
							message:
								"Chained method calls; consider flow for reusable pipeline",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use flow((arr: ReadonlyArray<T>) => arr, Array.filter(pred), Array.map(fn)) from effect for composable, reusable pipelines. The anonymous function as the first argument helps with type inference.",
						}),
					);
				}
			}

			// Also detect nested function calls like (x) => f(g(h(x)))
			if (ts.isCallExpression(body)) {
				let depth = 0;
				let current: ts.Node = body;

				while (ts.isCallExpression(current)) {
					// Only count if the argument is also a call (nested calls)
					if (current.arguments.length > 0) {
						const firstArg = current.arguments[0];
						if (ts.isCallExpression(firstArg)) {
							depth++;
							current = firstArg;
						} else {
							depth++;
							break;
						}
					} else {
						break;
					}
				}

				if (depth >= 3) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push(
						new NativeApisViolation({
							category: "native-apis",
							ruleId: meta.id,
							message:
								"Nested function composition; use flow for reusable pipeline",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use flow((x: T) => x, h, g, f) from effect for composable, reusable pipelines. The anonymous function as the first argument helps with type inference.",
						}),
					);
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
