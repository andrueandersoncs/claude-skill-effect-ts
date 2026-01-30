/**
 * rule-005: filter-and-transform-single-pass
 *
 * Rule: Never chain filter then map; use Array.filterMap in one pass
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "native-apis",
	name: "filter-and-transform-single-pass",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect .filter().map() or .map().filter() chains
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const outerMethod = node.expression.name.text;
			const inner = node.expression.expression;

			if (
				ts.isCallExpression(inner) &&
				ts.isPropertyAccessExpression(inner.expression)
			) {
				const innerMethod = inner.expression.name.text;

				// Check for filter().map() or map().filter()
				if (
					(outerMethod === "map" && innerMethod === "filter") ||
					(outerMethod === "filter" && innerMethod === "map")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"filter() then map() chain; use Array.filterMap for single pass",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "definite",
						suggestion:
							"Use Array.filterMap(array, (item) => predicate(item) ? Option.some(transform(item)) : Option.none())",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
