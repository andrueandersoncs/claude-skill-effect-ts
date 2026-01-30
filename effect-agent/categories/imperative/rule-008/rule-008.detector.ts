/**
 * rule-008: recursive-effect-processing
 *
 * Rule: Never use imperative loops for tree traversal; use recursion with Effect
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "imperative",
	name: "recursive-effect-processing",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect while loops with stack/queue patterns (tree traversal)
		if (ts.isWhileStatement(node)) {
			const bodyText = node.statement.getText(sourceFile).toLowerCase();
			const conditionText = node.expression.getText(sourceFile).toLowerCase();

			// Check for stack/queue based traversal patterns
			if (
				(conditionText.includes("stack") ||
					conditionText.includes("queue") ||
					conditionText.includes("length")) &&
				(bodyText.includes("push") ||
					bodyText.includes("pop") ||
					bodyText.includes("shift") ||
					bodyText.includes("children") ||
					bodyText.includes("child"))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Imperative tree traversal with stack/queue; use recursive Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use recursive Effect.gen with Effect.forEach for children: const traverse = (node) => Effect.gen(function* () { ... yield* Effect.forEach(node.children, traverse) })",
				});
			}
		}

		// Detect for loops that look like tree traversal
		if (ts.isForStatement(node)) {
			const bodyText = node.statement.getText(sourceFile).toLowerCase();
			if (
				(bodyText.includes("children") || bodyText.includes("child")) &&
				(bodyText.includes("push") || bodyText.includes("stack"))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Imperative tree iteration; use recursive Effect for tree traversal",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Define a recursive function returning Effect.gen and use Effect.forEach for children",
				});
			}
		}

		// Detect for-of loops that iterate over children in async/recursive context
		if (ts.isForOfStatement(node)) {
			const iterableText = node.expression.getText(sourceFile).toLowerCase();
			const bodyText = node.statement.getText(sourceFile).toLowerCase();

			// Check if iterating over children with recursive calls or async operations
			if (
				(iterableText.includes("children") || iterableText.includes("child")) &&
				(bodyText.includes("await") ||
					bodyText.includes("push") ||
					bodyText.includes("results"))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Imperative for-of loop for tree traversal; use recursive Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Effect.forEach(node.children, traverse) with a recursive Effect.gen function",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
