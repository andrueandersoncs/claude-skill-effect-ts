/**
 * rule-007: schema-filters
 *
 * Rule: Never use manual validation functions; use Schema filters
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "schema",
	name: "schema-filters",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect typeof checks (should use Schema.is)
		if (ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "typeof checks should use Schema.is() type guards",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "Use Schema.is(MySchema) for type-safe runtime checks",
			});
		}

		// Detect instanceof checks (should use Schema.is for Schema classes)
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"instanceof checks may be replaced with Schema.is() for Schema classes",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "If checking Schema.Class, use Schema.is(MyClass) instead",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
