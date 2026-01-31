/**
 * rule-004: conditional-fail
 *
 * Rule: Never use throw statements; use Effect.fail()
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "errors",
	name: "conditional-fail",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect throw statements inside if/else blocks (conditional throws)
		if (ts.isThrowStatement(node)) {
			let parent = node.parent;
			let isConditional = false;

			while (parent) {
				if (ts.isIfStatement(parent) || ts.isConditionalExpression(parent)) {
					isConditional = true;
					break;
				}
				if (
					ts.isFunctionDeclaration(parent) ||
					ts.isFunctionExpression(parent) ||
					ts.isArrowFunction(parent)
				) {
					break;
				}
				parent = parent.parent;
			}

			if (isConditional) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Conditional throw should use Effect.fail() or Effect.when",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Effect.fail() with Effect.when() or Effect.unless()",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
