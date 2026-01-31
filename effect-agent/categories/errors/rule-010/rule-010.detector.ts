/**
 * rule-010: sandbox-catch-tags
 *
 * Rule: Never use try/catch for Effect errors; use Effect.sandbox with catchTags
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "errors",
	name: "sandbox-catch-tags",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect try/catch around Effect.runPromise or Effect.runSync
		if (ts.isTryStatement(node)) {
			const tryText = node.tryBlock.getText(sourceFile);

			if (
				tryText.includes("Effect.runPromise") ||
				tryText.includes("Effect.runSync") ||
				tryText.includes("runPromise") ||
				tryText.includes("runSync")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"try/catch around Effect run; use Effect.sandbox and catchTags",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion:
						"Use effect.pipe(Effect.sandbox, Effect.catchTags({ _tag: ... })) to handle both defects and errors",
				});
			}
		}

		// Detect catch blocks checking instanceof for Effect errors
		if (ts.isCatchClause(node) && node.variableDeclaration) {
			const blockText = node.block.getText(sourceFile);

			if (
				blockText.includes("instanceof") &&
				(blockText.includes("Error") || blockText.includes("_tag"))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"instanceof checks in catch; use Effect.catchTags for type-safe error handling",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion:
						"Use Effect.catchTags({ ErrorA: (e) => ..., ErrorB: (e) => ... }) for exhaustive error handling",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
