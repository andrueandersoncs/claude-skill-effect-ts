/**
 * rule-008: result-effect-match
 *
 * Rule: Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "conditionals",
	name: "result-effect-match",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect if statements checking .success, .error, .ok, .err, .isError, .isSuccess flags
		if (ts.isIfStatement(node)) {
			const condText = node.expression.getText(sourceFile).toLowerCase();

			const resultFlagPatterns = [
				/\.success\b/,
				/\.error\b/,
				/\.ok\b/,
				/\.err\b/,
				/\.iserror\b/,
				/\.issuccess\b/,
				/\.isfailure\b/,
				/\.isok\b/,
				/result\s*===?\s*(true|false)/,
				/error\s*!==?\s*(null|undefined)/,
			];

			for (const pattern of resultFlagPatterns) {
				if (pattern.test(condText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Result/error flag check; use Effect.match or Either.match",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.expression.getText(sourceFile).slice(0, 80),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Effect.match({ onSuccess: ..., onFailure: ... }) or Either.match({ onLeft: ..., onRight: ... })",
					});
					break;
				}
			}
		}

		// Detect ternary with result checks
		if (ts.isConditionalExpression(node)) {
			const condText = node.condition.getText(sourceFile).toLowerCase();
			if (
				condText.includes(".success") ||
				condText.includes(".error") ||
				condText.includes(".ok") ||
				condText.includes(".err")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Ternary with result flag check; use Effect.match or Either.match",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Effect.match({ onSuccess: ..., onFailure: ... }) for declarative handling",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
