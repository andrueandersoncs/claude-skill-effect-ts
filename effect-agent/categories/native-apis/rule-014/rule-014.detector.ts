/**
 * rule-014: struct-predicate
 *
 * Rule: Never use manual &&/|| for predicates; use Predicate.and/or/not
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "native-apis",
	name: "struct-predicate",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect arrow functions that combine predicates with && or ||
		if (ts.isArrowFunction(node)) {
			const body = node.body;

			if (ts.isBinaryExpression(body)) {
				const op = body.operatorToken.kind;

				// Check for && or || combining predicate calls
				if (
					op === ts.SyntaxKind.AmpersandAmpersandToken ||
					op === ts.SyntaxKind.BarBarToken
				) {
					const left = body.left;
					const right = body.right;

					// Check if both sides look like predicate calls
					const isPredicateCall = (n: ts.Node): boolean => {
						if (ts.isCallExpression(n)) return true;
						if (ts.isPrefixUnaryExpression(n) && ts.isCallExpression(n.operand))
							return true;
						return false;
					};

					if (isPredicateCall(left) && isPredicateCall(right)) {
						const opName =
							op === ts.SyntaxKind.AmpersandAmpersandToken ? "&&" : "||";
						const predicateOp =
							op === ts.SyntaxKind.AmpersandAmpersandToken ? "and" : "or";

						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message: `Predicate combination with ${opName}; use Predicate.${predicateOp}`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion: `Use Predicate.${predicateOp}(predicate1, predicate2) for composable predicates`,
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
