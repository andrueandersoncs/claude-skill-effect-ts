/**
 * rule-008: fat-arrow-syntax
 *
 * Rule: Never use the function keyword; use fat arrow syntax
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "code-style",
	name: "fat-arrow-syntax",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect function declarations (should use arrow functions)
		if (ts.isFunctionDeclaration(node) && node.name) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Function declarations should use arrow function syntax",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "warning",
				certainty: "potential",
				suggestion: `Convert to: const ${node.name.text} = (...) => { ... }`,
			});
		}

		// Detect function expressions (should use arrow functions)
		if (ts.isFunctionExpression(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Function expressions should use arrow function syntax",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "warning",
				certainty: "potential",
				suggestion: "Convert to arrow function: (...) => { ... }",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
