/**
 * rule-009: splitting-array-by-condition
 *
 * Rule: Never filter twice with opposite conditions; use Array.partition
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "imperative",
	name: "splitting-array-by-condition",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track filter calls to detect duplicate filtering
	const filterCalls: Array<{
		node: ts.CallExpression;
		arrayName: string;
		predicateText: string;
	}> = [];

	const visit = (node: ts.Node) => {
		// Detect .filter() calls
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "filter"
		) {
			const arrayExpr = node.expression.expression;
			const arrayName = arrayExpr.getText(sourceFile);

			if (node.arguments.length > 0) {
				const predicateText = node.arguments[0].getText(sourceFile);

				// Check if we've seen a filter on the same array
				for (const existing of filterCalls) {
					if (existing.arrayName === arrayName) {
						// Check for opposite conditions (negated predicate or complementary comparisons)
						const isOpposite =
							(predicateText.includes("!") &&
								!existing.predicateText.includes("!")) ||
							(!predicateText.includes("!") &&
								existing.predicateText.includes("!")) ||
							predicateText.includes("!==") !==
								existing.predicateText.includes("!==") ||
							predicateText.includes("!=") !==
								existing.predicateText.includes("!=") ||
							// Check for complementary comparison operators
							(predicateText.includes("<") &&
								existing.predicateText.includes(">=")) ||
							(predicateText.includes(">=") &&
								existing.predicateText.includes("<")) ||
							(predicateText.includes(">") &&
								existing.predicateText.includes("<=")) ||
							(predicateText.includes("<=") &&
								existing.predicateText.includes(">"));

						if (isOpposite) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Filtering same array twice with opposite conditions; use Array.partition",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "warning",
								certainty: "potential",
								suggestion: `Use Array.partition(${arrayName}, predicate) to split into [matching, nonMatching] in one pass`,
							});
						}
					}
				}

				filterCalls.push({ node, arrayName, predicateText });
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
