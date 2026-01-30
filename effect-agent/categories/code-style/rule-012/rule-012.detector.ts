/**
 * rule-012: unknown-conversion
 *
 * Rule: Never use 'as unknown as T'; define a Schema instead
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "code-style",
	name: "unknown-conversion",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect type assertions 'as any' or 'as unknown'
		if (ts.isAsExpression(node)) {
			const typeText = node.type.getText(sourceFile);

			if (typeText === "any" || typeText === "unknown") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Type assertion 'as ${typeText}' should be replaced with Schema validation`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Schema.decodeUnknown() for type-safe validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
