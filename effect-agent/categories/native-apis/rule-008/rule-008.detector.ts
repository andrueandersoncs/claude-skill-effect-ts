/**
 * rule-008: grouping-items-by-key
 *
 * Rule: Never manually group with loops; use Array.groupBy
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "native-apis",
	name: "grouping-items-by-key",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect new Map()
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Map"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "new Map() may be replaced with HashMap from Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "Consider HashMap from effect for map operations",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
