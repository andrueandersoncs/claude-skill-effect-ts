/**
 * rule-003: match-struct-conditions
 *
 * Rule: Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "conditionals",
	name: "match-struct-conditions",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const countAndConditions = (node: ts.Node): number => {
		if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
		) {
			return 1 + countAndConditions(node.left) + countAndConditions(node.right);
		}
		return 0;
	};

	const visit = (node: ts.Node) => {
		// Detect if statements with multiple AND conditions
		if (ts.isIfStatement(node)) {
			const condition = node.expression;
			const andCount = countAndConditions(condition);

			if (andCount >= 1) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Multiple AND conditions; consider Schema.Struct with Match.when",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: condition.getText(sourceFile).slice(0, 100),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Define Schema.Struct({ prop1: Schema.filter(...), prop2: ... }) and use Match.when(Schema.is(struct), ...)",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
