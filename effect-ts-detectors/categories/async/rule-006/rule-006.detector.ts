/**
 * rule-006: race-operations
 *
 * Rule: Never use Promise.race; use Effect.race or Effect.raceAll
 */

import * as ts from "typescript";
import {
	AsyncViolation,
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../src/types.js";

const meta = {
	id: "rule-006",
	category: "async",
	name: "race-operations",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Promise.race, Promise.any
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

				if (method === "race") {
					violations.push(
						new AsyncViolation({
							category: "async",
							ruleId: meta.id,
							message: "Promise.race() should be replaced with Effect.race()",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion: "Use Effect.race()",
						}),
					);
				} else if (method === "any") {
					violations.push(
						new AsyncViolation({
							category: "async",
							ruleId: meta.id,
							message: "Promise.any() should be replaced with Effect.raceAll()",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "definite",
							suggestion: "Use Effect.raceAll()",
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
