/**
 * rule-002: conditional-transformation
 *
 * Rule: Never use (x) => x; use Function.identity
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "native-apis",
	name: "conditional-transformation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect (x) => x or x => x patterns
		if (ts.isArrowFunction(node)) {
			const params = node.parameters;
			const body = node.body;

			if (params.length === 1 && ts.isIdentifier(body)) {
				const paramName = params[0].name.getText(sourceFile);
				const bodyName = body.text;

				if (paramName === bodyName) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Identity function (x) => x; use Function.identity",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						certainty: "definite",
						suggestion:
							"Import and use Function.identity from effect for clarity",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
