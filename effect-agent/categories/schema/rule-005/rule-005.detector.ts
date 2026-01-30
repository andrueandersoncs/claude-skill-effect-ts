/**
 * rule-005: schema-class
 *
 * Rule: Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "schema",
	name: "schema-class",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect interface declarations (should potentially be Schema.Class)
		if (ts.isInterfaceDeclaration(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Interface '${node.name.text}' should be defined as Schema.Class for runtime validation`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "warning",
				certainty: "potential",
				suggestion: `Convert to: class ${node.name.text} extends Schema.Class<${node.name.text}>()({...})`,
			});
		}

		// Detect type aliases with object types
		if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Type alias '${node.name.text}' should use Schema.Struct or Schema.Class`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "warning",
				certainty: "potential",
				suggestion:
					"Convert to Schema.Struct() or Schema.Class() for runtime validation",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
