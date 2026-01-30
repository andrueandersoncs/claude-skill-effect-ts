/**
 * rule-010: ternary-to-match
 *
 * Rule: Never use ternary operators; define Schema types for each range and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "conditionals",
	name: "ternary-to-match",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect ternary operators
		if (ts.isConditionalExpression(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			const conditionText = node.condition.getText(sourceFile);

			// Skip null checks (handled by rule-006)
			if (
				conditionText.includes("!= null") ||
				conditionText.includes("!== null") ||
				conditionText.includes("== null") ||
				conditionText.includes("=== null") ||
				conditionText.includes("!= undefined") ||
				conditionText.includes("!== undefined")
			) {
				ts.forEachChild(node, visit);
				return;
			}

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Use Match module or Option instead of ternary operators",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion: "Replace with Match.value() + Match.when() or pipe",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
