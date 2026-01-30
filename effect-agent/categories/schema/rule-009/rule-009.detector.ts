/**
 * rule-009: schema-tagged-error
 *
 * Rule: Never use Data.TaggedError; use Schema.TaggedError
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "schema",
	name: "schema-tagged-error",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect classes extending Error (should use Schema.TaggedError)
		if (ts.isClassDeclaration(node) && node.heritageClauses) {
			for (const clause of node.heritageClauses) {
				if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
					for (const type of clause.types) {
						const typeText = type.getText(sourceFile);
						const typeName = type.expression.getText(sourceFile);

						// Check for plain Error
						if (typeName === "Error") {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message: "Error classes should extend Schema.TaggedError",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "error",
								certainty: "definite",
								suggestion:
									"Use Schema.TaggedError('ErrorName')({ fields }) pattern",
							});
						}

						// Check for Data.TaggedError (should use Schema.TaggedError)
						if (typeText.includes("Data.TaggedError")) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Data.TaggedError should be replaced with Schema.TaggedError for serialization support",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "warning",
								certainty: "potential",
								suggestion:
									"Use class MyError extends Schema.TaggedError<MyError>()('MyError', { fields }) {} for serializable errors",
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
