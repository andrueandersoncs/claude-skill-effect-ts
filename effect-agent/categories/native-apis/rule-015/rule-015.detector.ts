/**
 * rule-015: tuple-transformation
 *
 * Rule: Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-015",
	category: "native-apis",
	name: "tuple-transformation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect tuple[0] or tuple[1] access
		if (ts.isElementAccessExpression(node)) {
			const arg = node.argumentExpression;

			if (arg && ts.isNumericLiteral(arg)) {
				const index = parseInt(arg.text, 10);

				if (index === 0 || index === 1) {
					const accessor = index === 0 ? "getFirst" : "getSecond";
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Tuple index [${index}]; use Tuple.${accessor}`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "info",
						certainty: "potential",
						suggestion: `Use Tuple.${accessor}(tuple) for type-safe tuple access`,
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
