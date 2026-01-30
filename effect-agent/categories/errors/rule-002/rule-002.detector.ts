/**
 * rule-002: catch-tag
 *
 * Rule: Never check error._tag manually; use Effect.catchTag
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "errors",
	name: "catch-tag",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect property access on ._tag (error._tag checks)
		if (ts.isPropertyAccessExpression(node) && node.name.text === "_tag") {
			// Check if inside an if condition or comparison
			let parent = node.parent;
			while (parent) {
				if (
					ts.isBinaryExpression(parent) &&
					(parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
						parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Manual _tag checking should use Effect.catchTag",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: parent.getText(sourceFile).slice(0, 80),
						severity: "warning",
						certainty: "potential",
						suggestion: "Use Effect.catchTag() for type-safe error handling",
					});
					break;
				}
				parent = parent.parent;
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
