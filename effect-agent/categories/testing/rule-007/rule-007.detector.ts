/**
 * rule-007: it-effect
 *
 * Rule: Never use Effect.runPromise in tests; use it.effect from @effect/vitest
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "testing",
	name: "it-effect",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files (and .bad.ts for testing the detector)
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const visit = (node: ts.Node) => {
		// Detect Effect.runPromise/runSync in tests
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Effect") {
				if (
					method === "runPromise" ||
					method === "runSync" ||
					method === "runPromiseExit" ||
					method === "runSyncExit"
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Effect.${method}() in tests should use it.effect() from @effect/vitest`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Use it.effect('test name', () => Effect.gen(...)) from @effect/vitest",
					});
				}
			}
		}

		// Detect it() or test() with Effect code inside
		if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
			const funcName = node.expression.text;
			if (funcName === "it" || funcName === "test") {
				const args = node.arguments;
				if (args.length >= 2) {
					const callback = args[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);
						if (
							bodyText.includes("Effect.") ||
							bodyText.includes("yield*") ||
							bodyText.includes("Effect.gen")
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Tests with Effects should use it.effect() from @effect/vitest",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								severity: "error",
								certainty: "potential",
								suggestion: `Replace ${funcName}() with it.effect() for Effect-based tests`,
							});
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
