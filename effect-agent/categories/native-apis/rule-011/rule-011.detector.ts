/**
 * rule-011: removing-duplicates
 *
 * Rule: Never use [...new Set()]; use Array.dedupe
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "native-apis",
	name: "removing-duplicates",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect [...new Set()] pattern
		if (ts.isSpreadElement(node)) {
			const child = node.expression;
			if (
				ts.isNewExpression(child) &&
				ts.isIdentifier(child.expression) &&
				child.expression.text === "Set"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "[...new Set()] should be replaced with Array.dedupe()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.parent.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Array.dedupe() from effect",
				});
			}
		}

		// Detect new Set() generally
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Set"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "new Set() may be replaced with HashSet from Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "Consider HashSet from effect for set operations",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
