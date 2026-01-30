/**
 * rule-013: tagged-union-state
 *
 * Rule: Never use optional properties for state; use tagged unions
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "schema",
	name: "tagged-union-state",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect plain object literals with _tag property (should be Schema.TaggedClass)
		if (ts.isObjectLiteralExpression(node)) {
			const hasTag = node.properties.some(
				(prop) =>
					ts.isPropertyAssignment(prop) &&
					ts.isIdentifier(prop.name) &&
					prop.name.text === "_tag",
			);

			if (hasTag) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Objects with _tag should be Schema.TaggedClass instances",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: "Define a Schema.TaggedClass and use its constructor",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
