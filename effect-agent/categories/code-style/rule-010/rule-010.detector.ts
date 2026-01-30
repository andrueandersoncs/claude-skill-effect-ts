/**
 * rule-010: non-null-assertion
 *
 * Rule: Never use ! (non-null assertion); use Option or Effect
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "code-style",
	name: "non-null-assertion",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect non-null assertions (!)
		if (ts.isNonNullExpression(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Non-null assertion (!) should be replaced with Option or Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile),
				severity: "error",
				certainty: "definite",
				suggestion:
					"Use Option.fromNullable() with Option.match() or Effect error handling",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
