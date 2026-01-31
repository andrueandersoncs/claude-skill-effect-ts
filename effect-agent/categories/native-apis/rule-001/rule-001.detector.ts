/**
 * rule-001: composing-two-functions
 *
 * Rule: Never nest two function calls; use Function.compose
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "native-apis",
	name: "composing-two-functions",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect nested function calls like f(g(x))
		if (ts.isCallExpression(node)) {
			const arg = node.arguments[0];
			if (arg && ts.isCallExpression(arg)) {
				// Check if both are simple function calls (not method calls)
				const outerFunc = node.expression;
				const innerFunc = arg.expression;

				if (ts.isIdentifier(outerFunc) && ts.isIdentifier(innerFunc)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Nested function calls; consider Function.compose or pipe",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion:
							"Use pipe(x, g, f) or Function.compose(f, g)(x) for clearer composition",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
