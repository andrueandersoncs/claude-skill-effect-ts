/**
 * rule-002: partitioning-by-tag
 *
 * Rule: Never use ._tag in array predicates; use Schema.is(Variant)
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "discriminated-unions",
	name: "partitioning-by-tag",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect filter/find/some/every/findIndex with ._tag checks
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const methodName = node.expression.name.text;
			const arrayMethods = ["filter", "find", "some", "every", "findIndex"];

			if (arrayMethods.includes(methodName)) {
				const args = node.arguments;
				if (args.length > 0) {
					const argText = args[0].getText(sourceFile);
					if (argText.includes("._tag")) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message: `${methodName} by ._tag may miss cases; use Schema.is(Variant)`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Use Schema.is(MyVariant) as predicate for type-safe narrowing",
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
