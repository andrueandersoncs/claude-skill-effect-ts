/**
 * rule-011: schema-union
 *
 * Rule: Never use TypeScript union types; use Schema.Union of TaggedClass
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "schema",
	name: "schema-union",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect type aliases that are union types
		if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
			// Skip literal unions (handled by rule-008)
			if (!node.type.types.every(ts.isLiteralTypeNode)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Type alias '${node.name.text}' union should use Schema.Union`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: "Convert to Schema.Union() for runtime validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
