/**
 * rule-002: dynamic-data
 *
 * Rule: Never use 'as any'; fix the type or create a Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "code-style",
	name: "dynamic-data",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect 'as any' assertions
		if (ts.isAsExpression(node)) {
			const typeText = node.type.getText(sourceFile);
			if (typeText === "any") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "'as any' bypasses type safety; fix the type or use Schema",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Define a Schema for the data shape and use Schema.decodeUnknown for validation",
				});
			}
		}

		// Detect 'as unknown as T' pattern
		if (ts.isAsExpression(node) && ts.isAsExpression(node.expression)) {
			const innerType = node.expression.type.getText(sourceFile);
			if (innerType === "unknown") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "'as unknown as T' double assertion; use Schema validation",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use Schema.decodeUnknown(TargetSchema)(value) for proper type validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
