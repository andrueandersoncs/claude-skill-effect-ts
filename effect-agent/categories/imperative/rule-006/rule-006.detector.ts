/**
 * rule-006: flattening-nested-arrays
 *
 * Rule: Never use nested for loops; use Array.flatMap
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "imperative",
	name: "flattening-nested-arrays",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const isLoop = (node: ts.Node): boolean => {
		return (
			ts.isForStatement(node) ||
			ts.isForOfStatement(node) ||
			ts.isForInStatement(node) ||
			ts.isWhileStatement(node) ||
			ts.isDoStatement(node)
		);
	};

	const visit = (node: ts.Node) => {
		// Detect nested loops (loop inside loop)
		if (isLoop(node)) {
			let hasNestedLoop = false;

			const checkForNestedLoop = (inner: ts.Node) => {
				if (isLoop(inner)) {
					hasNestedLoop = true;
					return;
				}
				ts.forEachChild(inner, checkForNestedLoop);
			};

			ts.forEachChild(node, checkForNestedLoop);

			if (hasNestedLoop) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Nested loops should use Array.flatMap or Effect.flatMap",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "definite",
					suggestion: "Use Array.flatMap() to flatten nested iterations",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
