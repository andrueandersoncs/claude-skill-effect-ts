/**
 * rule-005: effect-try-promise
 *
 * Rule: Never use try/catch with async; use Effect.tryPromise()
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "errors",
	name: "effect-try-promise",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect try/catch with await inside
		if (ts.isTryStatement(node)) {
			const tryBlockText = node.tryBlock.getText(sourceFile);

			if (tryBlockText.includes("await")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "try/catch with await; use Effect.tryPromise instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Use Effect.tryPromise({ try: () => asyncOp(), catch: (e) => new MyError(e) })",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
