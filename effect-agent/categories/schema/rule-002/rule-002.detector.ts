/**
 * rule-002: no-plain-error
 *
 * Rule: Never extend plain Error class; use Schema.TaggedError
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "schema",
	name: "no-plain-error",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect class extends Error
		if (ts.isClassDeclaration(node) && node.heritageClauses) {
			for (const clause of node.heritageClauses) {
				if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
					for (const type of clause.types) {
						const typeText = type.expression.getText(sourceFile);
						if (
							typeText === "Error" ||
							typeText === "TypeError" ||
							typeText === "RangeError"
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message: `Class extends ${typeText}; use Schema.TaggedError instead`,
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: `class ${node.name?.text || "anonymous"} extends ${typeText}`,
								severity: "warning",
								certainty: "definite",
								suggestion:
									"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { ... }) for typed errors",
							});
						}
					}
				}
			}
		}

		// Detect new Error() with custom message formatting
		if (ts.isNewExpression(node)) {
			const expr = node.expression;
			if (ts.isIdentifier(expr) && expr.text === "Error") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "new Error(); use Schema.TaggedError for domain errors",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Define error types with Schema.TaggedError for typed error handling with Effect",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
