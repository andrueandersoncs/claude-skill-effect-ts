/**
 * rule-014: schema-constraints
 *
 * Rule: Never use fast-check .filter(); use Schema constraints
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "testing",
	name: "schema-constraints",
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
		// Detect .filter() on fast-check arbitraries
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "filter"
		) {
			// Check if the object is a fast-check arbitrary (fc.*)
			let current = node.expression.expression;

			// Walk up the chain to find fc.*
			while (ts.isCallExpression(current)) {
				if (ts.isPropertyAccessExpression(current.expression)) {
					const obj = current.expression.expression;
					if (ts.isIdentifier(obj) && obj.text === "fc") {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								".filter() on fast-check arbitrary; use Schema constraints instead",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Define constraints in Schema: Schema.Number.pipe(Schema.positive(), Schema.lessThan(100)) instead of fc.integer().filter(...)",
						});
						break;
					}
					current = current.expression.expression;
				} else {
					break;
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
