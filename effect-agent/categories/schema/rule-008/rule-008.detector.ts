/**
 * rule-008: schema-literal
 *
 * Rule: Never use TypeScript enum; use Schema.Literal
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "schema",
	name: "schema-literal",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect enum declarations (should use Schema.Literal union)
		if (ts.isEnumDeclaration(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Enum '${node.name.text}' should be replaced with Schema.Literal union`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
				certainty: "potential",
				suggestion: "Convert to Schema.Literal('value1', 'value2', ...)",
			});
		}

		// Detect type aliases with literal types
		if (ts.isTypeAliasDeclaration(node)) {
			if (
				ts.isLiteralTypeNode(node.type) ||
				(ts.isUnionTypeNode(node.type) &&
					node.type.types.every(ts.isLiteralTypeNode))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Type alias '${node.name.text}' with literal types should use Schema.Literal`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					certainty: "potential",
					suggestion: "Convert to Schema.Literal() for runtime validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
