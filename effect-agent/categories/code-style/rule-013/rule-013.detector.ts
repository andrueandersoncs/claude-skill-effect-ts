/**
 * rule-013: unused-variable
 *
 * Rule: Never use eslint-disable comments; fix the underlying issue
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "code-style",
	name: "unused-variable",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect unused variables (underscore prefix or _unused pattern)
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
			const name = node.name.text;
			// Skip if it's a destructuring ignore pattern
			if (name.startsWith("_") && name !== "_" && !name.startsWith("__")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Variable prefixed with underscore may indicate unused value",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 60),
					severity: "info",
					certainty: "potential",
					suggestion: "Remove unused variables or use them",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
