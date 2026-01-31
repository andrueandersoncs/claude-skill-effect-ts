/**
 * rule-011: ts-imports
 *
 * Rule: Never import from ".js" files; always import from ".ts" files directly
 *
 * Note: This rule is project-specific. Some projects require .js extensions
 * for ESM compatibility. Adjust based on your project's module resolution.
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "code-style",
	name: "ts-imports",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect import declarations with .js extension
		if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
			const specifier = node.moduleSpecifier;
			if (ts.isStringLiteral(specifier)) {
				const importPath = specifier.text;

				// Check for .js imports of local files (relative imports)
				if (
					importPath.endsWith(".js") &&
					(importPath.startsWith("./") || importPath.startsWith("../"))
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Import with .js extension; consider importing .ts directly",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						certainty: "potential",
						suggestion:
							"Import from .ts files directly if your bundler/runtime supports it, or use extensionless imports",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
