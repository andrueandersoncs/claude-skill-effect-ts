/**
 * rule-009: fix-types
 *
 * Rule: Never suppress type errors with comments; fix the types
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "code-style",
	name: "fix-types",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect type assertions (as) that aren't 'as any' or 'as unknown' (those are rule-012)
		if (ts.isAsExpression(node)) {
			const typeText = node.type.getText(sourceFile);

			// Skip 'as any' and 'as unknown' - those are handled by rule-012
			if (typeText !== "any" && typeText !== "unknown") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Type assertions may hide type errors; consider Schema validation",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Consider using Schema validation or fixing the types at source",
				});
			}
		}

		// Detect angle-bracket type assertions (<Type>expr)
		if (ts.isTypeAssertionExpression(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Type assertions may hide type errors; consider Schema validation",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "warning",
				certainty: "potential",
				suggestion:
					"Consider using Schema validation or fixing the types at source",
			});
		}

		// Detect 'any' type annotations
		if (ts.isTypeReferenceNode(node)) {
			const typeName = node.typeName.getText(sourceFile);
			if (typeName === "any") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "'any' type should be replaced with proper typing or Schema",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.parent.getText(sourceFile).slice(0, 80),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Schema validation or explicit types",
				});
			}
		}

		// Detect ': any' in parameter/variable declarations
		if ((ts.isParameter(node) || ts.isVariableDeclaration(node)) && node.type) {
			if (node.type.kind === ts.SyntaxKind.AnyKeyword) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"'any' type annotation should be replaced with proper typing",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Schema validation or explicit types",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
