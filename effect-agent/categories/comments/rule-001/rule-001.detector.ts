/**
 * rule-001: branded-type-definition
 *
 * Rule: Never add JSDoc comments that merely restate the type definition
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "comments",
	name: "branded-type-definition",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Helper to check if a JSDoc comment is redundant
	const checkJSDocComment = (
		_node: ts.Node,
		typeName: string,
		comment: ts.CommentRange,
	) => {
		const commentText = fullText.slice(comment.pos, comment.end);

		// Check if it's a JSDoc comment
		if (commentText.startsWith("/**")) {
			const typeNameLower = typeName.toLowerCase();

			// Patterns that indicate restating the type
			const redundantPatterns = [
				new RegExp(`@description\\s+${typeNameLower}`, "i"),
				new RegExp(`represents\\s+(a\\s+)?${typeNameLower}`, "i"),
				new RegExp(`the\\s+${typeNameLower}\\s+type`, "i"),
				new RegExp(`a\\s+${typeNameLower}\\s+value`, "i"),
				/^\/\*\*\s*\n\s*\*\s*\w+\s*\n\s*\*\/$/m, // Just the type name
				// Pattern for "Branded type for X" which just restates what's obvious
				/branded\s+type\s+(for|of)\s+/i,
				// Pattern for "Type for X" or "Interface for X"
				/(type|interface)\s+(for|of)\s+/i,
			];

			const isRedundant = redundantPatterns.some((p) => p.test(commentText));

			if (isRedundant) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					comment.pos,
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"JSDoc comment restates type definition; types are self-documenting",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: commentText.slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Remove redundant JSDoc; branded types and interfaces are self-documenting",
				});
			}
		}
	};

	const visit = (node: ts.Node) => {
		// Check type aliases and interfaces for redundant JSDoc
		if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
			const comments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);
			if (comments) {
				for (const comment of comments) {
					checkJSDocComment(node, node.name.text, comment);
				}
			}
		}

		// Check variable declarations (for branded types like `const X = Schema.String.pipe(...)`)
		if (ts.isVariableStatement(node)) {
			const comments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);
			if (comments) {
				for (const decl of node.declarationList.declarations) {
					if (ts.isIdentifier(decl.name)) {
						for (const comment of comments) {
							checkJSDocComment(node, decl.name.text, comment);
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
