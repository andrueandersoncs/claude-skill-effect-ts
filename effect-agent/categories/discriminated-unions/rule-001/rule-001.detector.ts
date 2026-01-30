/**
 * rule-001: match-tag-dispatch
 *
 * Rule: Never use if/else on ._tag; use Match.tag for discriminated unions
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "discriminated-unions",
	name: "match-tag-dispatch",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect direct ._tag access
		if (ts.isPropertyAccessExpression(node) && node.name.text === "_tag") {
			// Skip if in type context
			let parent = node.parent;
			let isInTypeContext = false;
			let isInSchemaIs = false;
			let isInMatchTag = false;

			while (parent) {
				if (
					ts.isTypeAliasDeclaration(parent) ||
					ts.isInterfaceDeclaration(parent) ||
					ts.isTypeLiteralNode(parent)
				) {
					isInTypeContext = true;
					break;
				}

				// Check if inside Schema.is() or Match.tag() - that's okay
				if (ts.isCallExpression(parent)) {
					const callText = parent.expression.getText(sourceFile);
					if (callText.includes("Schema.is") || callText.includes(".is(")) {
						isInSchemaIs = true;
						break;
					}
					if (callText.includes("Match.tag") || callText.includes(".tag(")) {
						isInMatchTag = true;
						break;
					}
				}

				parent = parent.parent;
			}

			if (!isInTypeContext && !isInSchemaIs && !isInMatchTag) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Direct ._tag access; use Match.tag() or Schema.is() instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet:
						node.parent?.getText(sourceFile).slice(0, 100) ||
						node.getText(sourceFile),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Match.tag() for exhaustive pattern matching",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
