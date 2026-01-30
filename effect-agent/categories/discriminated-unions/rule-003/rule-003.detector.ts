/**
 * rule-003: runtime-validation
 *
 * Rule: Never cast unknown to check ._tag; use Schema.is() for validation
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "discriminated-unions",
	name: "runtime-validation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect 'in' operator checks for _tag
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.InKeyword
		) {
			const leftText = node.left.getText(sourceFile);
			if (leftText === '"_tag"' || leftText === "'_tag'") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "'_tag' in check should use Schema.is() type guard",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Schema.is(MyTaggedClass) for type-safe narrowing",
				});
			}
		}

		// Detect typeof checks combined with ._tag
		if (
			ts.isBinaryExpression(node) &&
			(node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
				node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken)
		) {
			const nodeText = node.getText(sourceFile);
			if (nodeText.includes("typeof") && nodeText.includes("_tag")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "typeof check with _tag should use Schema.is()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion: "Use Schema.is(MyTaggedClass) for type-safe validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
