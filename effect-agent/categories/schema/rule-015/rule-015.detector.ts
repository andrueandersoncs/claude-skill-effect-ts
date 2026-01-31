/**
 * rule-015: schema-class-over-struct
 *
 * Rule: Always use Schema.Class for named/exported schemas.
 * Schema.Struct is only acceptable for inline anonymous schemas.
 *
 * Detects:
 * - Schema.Struct calls assigned to const/let/var declarations
 * - Schema.Struct calls that are exported
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-015",
	category: "schema",
	name: "schema-class-over-struct",
};

/**
 * Check if a node is a Schema.Struct call expression
 */
const isSchemaStructCall = (node: ts.Node): node is ts.CallExpression => {
	if (!ts.isCallExpression(node)) return false;

	const expr = node.expression;

	// Check for Schema.Struct(...)
	if (ts.isPropertyAccessExpression(expr)) {
		const obj = expr.expression;
		const prop = expr.name;
		if (ts.isIdentifier(obj) && obj.text === "Schema") {
			if (ts.isIdentifier(prop) && prop.text === "Struct") {
				return true;
			}
		}
	}

	return false;
};

/**
 * Check if a variable declaration is assigned a Schema.Struct call
 */
const isStructAssignment = (
	node: ts.VariableDeclaration,
): ts.CallExpression | null => {
	if (node.initializer && isSchemaStructCall(node.initializer)) {
		return node.initializer;
	}
	return null;
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Check variable declarations
		if (ts.isVariableStatement(node)) {
			const isExported = node.modifiers?.some(
				(m) => m.kind === ts.SyntaxKind.ExportKeyword,
			);

			for (const decl of node.declarationList.declarations) {
				const structCall = isStructAssignment(decl);
				if (structCall && ts.isIdentifier(decl.name)) {
					const varName = decl.name.text;
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);

					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: isExported
							? `Exported Schema.Struct '${varName}' should be a Schema.Class`
							: `Schema.Struct assigned to '${varName}' should be a Schema.Class`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "definite",
						suggestion: `Convert to: class ${varName} extends Schema.Class<${varName}>("${varName}")({...})`,
					});
				}
			}
		}

		// Check for export declarations that re-export a Schema.Struct
		if (ts.isExportDeclaration(node) && node.exportClause) {
			// This handles: export { SomeStruct }
			// We'd need additional tracking to know if SomeStruct is a Schema.Struct
			// For now, we rely on catching it at the variable declaration
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
