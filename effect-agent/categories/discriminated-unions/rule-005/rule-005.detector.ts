/**
 * rule-005: schema-tagged-error
 *
 * Rule: Never use Data.TaggedError; use Schema.TaggedError for full compatibility
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "discriminated-unions",
	name: "schema-tagged-error",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Data.TaggedError usage
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (
				ts.isIdentifier(obj) &&
				obj.text === "Data" &&
				method === "TaggedError"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Data.TaggedError; use Schema.TaggedError for full Schema compatibility",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { ... }) for encoding/decoding support",
				});
			}
		}

		// Detect extends Data.TaggedError in class heritage
		if (ts.isClassDeclaration(node) && node.heritageClauses) {
			for (const clause of node.heritageClauses) {
				if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
					for (const type of clause.types) {
						const typeText = type.expression.getText(sourceFile);
						if (typeText.includes("Data.TaggedError")) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Class extends Data.TaggedError; use Schema.TaggedError",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: `class ${node.name?.text || "..."} extends Data.TaggedError`,
								severity: "warning",
								certainty: "definite",
								suggestion:
									"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { ... }) for Schema integration",
							});
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
