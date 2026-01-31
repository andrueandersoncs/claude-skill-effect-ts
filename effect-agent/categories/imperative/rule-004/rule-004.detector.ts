/**
 * rule-004: conditional-accumulation
 *
 * Rule: Never use for...of/for...in; use Array module functions
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "imperative",
	name: "conditional-accumulation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect for...of statements
		if (ts.isForOfStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "for...of loop; use Array module functions instead",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion:
					"Use Array.map, Array.filter, Array.reduce, Array.forEach, or Effect.forEach",
			});
		}

		// Detect for...in statements
		if (ts.isForInStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "for...in loop; use Record module functions instead",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion:
					"Use Record.map, Record.filter, Object.entries with Array functions, or Record.toEntries",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
