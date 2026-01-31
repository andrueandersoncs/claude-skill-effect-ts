/**
 * rule-005: effectful-iteration
 *
 * Rule: Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "imperative",
	name: "effectful-iteration",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect for loops
		if (ts.isForStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Use Effect.forEach or Array methods instead of for loops",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion: "Replace with Effect.forEach() or Array.map/filter/reduce",
			});
		}

		// Detect for...of loops
		if (ts.isForOfStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Use Effect.forEach or Array methods instead of for...of loops",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion: "Replace with Effect.forEach() or Array.map/filter/reduce",
			});
		}

		// Detect for...in loops
		if (ts.isForInStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Use Record.toEntries or Object methods instead of for...in loops",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion: "Replace with Record.toEntries() or Record.keys()",
			});
		}

		// Detect while loops
		if (ts.isWhileStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Use Effect.loop, Effect.iterate, or recursion instead of while loops",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion: "Replace with Effect.loop() or recursive Effect.gen()",
			});
		}

		// Detect do...while loops
		if (ts.isDoStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Use Effect.loop or recursion instead of do...while loops",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "definite",
				suggestion: "Replace with Effect.loop() or recursive Effect.gen()",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
