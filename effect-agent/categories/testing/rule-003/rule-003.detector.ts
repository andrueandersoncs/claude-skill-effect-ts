/**
 * rule-003: effect-exit
 *
 * Rule: Never use try/catch for error assertions; use Effect.exit
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

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

	// Only check test files
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__")
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
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use Exit.isSuccess/isFailure or it.effect with proper assertions",
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
