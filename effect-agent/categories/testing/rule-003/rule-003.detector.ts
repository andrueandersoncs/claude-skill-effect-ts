/**
 * rule-003: effect-exit
 *
 * Rule: Never use try/catch for error assertions; use Effect.exit
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "testing",
	name: "effect-exit",
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
		// Detect expect().toBe/toEqual with Exit values
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;
			if (
				method === "toBe" ||
				method === "toEqual" ||
				method === "toStrictEqual"
			) {
				const args = node.arguments;
				if (args.length > 0) {
					const argText = args[0].getText(sourceFile);
					if (
						argText.includes("Exit.") ||
						argText.includes("succeed") ||
						argText.includes("fail")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Exit comparisons should use Effect/Exit matchers from @effect/vitest",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use Exit.isSuccess/isFailure or it.effect with proper assertions",
						});
					}
				}
			}
		}

		// Detect try/catch around Effect.runPromise (bad pattern for error assertions)
		if (ts.isTryStatement(node)) {
			const tryBlock = node.tryBlock;
			const tryText = tryBlock.getText(sourceFile);

			// Check if the try block contains Effect.runPromise
			if (
				tryText.includes("Effect.runPromise") ||
				tryText.includes("Effect.runSync")
			) {
				// Check if catch block has error assertions
				if (node.catchClause) {
					const catchText = node.catchClause.getText(sourceFile);
					if (
						catchText.includes("expect") ||
						catchText.includes("_tag") ||
						catchText.includes("instanceof")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Using try/catch for error assertions; use Effect.exit instead",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion:
								"Use Effect.exit to get the Exit value and assert on it with Exit.isFailure/Exit.match",
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
