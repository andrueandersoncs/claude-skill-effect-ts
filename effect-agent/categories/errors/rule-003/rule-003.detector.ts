/**
 * rule-003: catch-tags
 *
 * Rule: Never use switch on error._tag; use Effect.catchTags
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "errors",
	name: "catch-tags",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect switch statements on ._tag
		if (ts.isSwitchStatement(node)) {
			const expr = node.expression;
			if (ts.isPropertyAccessExpression(expr) && expr.name.text === "_tag") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "switch on error._tag should use Effect.catchTags",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use Effect.catchTags() for handling multiple error types",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
