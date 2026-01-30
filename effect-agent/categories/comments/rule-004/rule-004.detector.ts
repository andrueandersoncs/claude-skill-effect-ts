/**
 * rule-004: function-documentation
 *
 * Rule: Never add JSDoc @param/@returns that just repeat the type signature
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "comments",
	name: "function-documentation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Check for JSDoc comments that just restate the function name
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isMethodDeclaration(node) ||
			ts.isArrowFunction(node)
		) {
			const jsDocComments = ts.getJSDocCommentsAndTags(node);
			for (const jsDoc of jsDocComments) {
				if (ts.isJSDoc(jsDoc) && jsDoc.comment) {
					const commentText =
						typeof jsDoc.comment === "string"
							? jsDoc.comment
							: jsDoc.comment.map((c) => c.getText(sourceFile)).join("");

					// Check if JSDoc just restates the function name
					const funcName =
						ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)
							? node.name?.getText(sourceFile)
							: undefined;

					if (funcName) {
						const normalizedComment = commentText
							.toLowerCase()
							.replace(/[^a-z]/g, "");
						const normalizedName = funcName
							.toLowerCase()
							.replace(/[^a-z]/g, "");

						if (
							normalizedComment.includes(normalizedName) &&
							commentText.length < 50
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(jsDoc.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"JSDoc just restates function name; document the 'why', not 'what'",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: commentText.slice(0, 60),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Document purpose, edge cases, or business context instead",
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
