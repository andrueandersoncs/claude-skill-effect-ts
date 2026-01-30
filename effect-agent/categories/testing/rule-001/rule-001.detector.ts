/**
 * rule-001: arbitrary-responses
 *
 * Rule: Never stub methods as "not implemented"; use Arbitrary-generated responses
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "testing",
	name: "arbitrary-responses",
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
		// Detect throw new Error("not implemented") patterns
		if (ts.isThrowStatement(node) && node.expression) {
			const throwText = node.expression.getText(sourceFile).toLowerCase();
			if (
				throwText.includes("not implemented") ||
				throwText.includes("not yet implemented") ||
				throwText.includes("todo") ||
				throwText.includes("stub")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Stub with 'not implemented'; use Arbitrary-generated responses",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Use Schema.Arbitrary to generate test responses: Arbitrary.make(ResponseSchema)",
				});
			}
		}

		// Detect Effect.die("not implemented") patterns
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (
				ts.isIdentifier(obj) &&
				obj.text === "Effect" &&
				(method === "die" || method === "fail")
			) {
				if (node.arguments.length > 0) {
					const argText = node.arguments[0].getText(sourceFile).toLowerCase();
					if (
						argText.includes("not implemented") ||
						argText.includes("stub") ||
						argText.includes("todo")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Effect stub with 'not implemented'; use Arbitrary-generated responses",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "warning",
							certainty: "definite",
							suggestion:
								"Generate proper test data with Schema.Arbitrary instead of stubbing",
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
