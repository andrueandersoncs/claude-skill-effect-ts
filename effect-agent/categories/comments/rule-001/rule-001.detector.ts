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

	const visit = (node: ts.Node) => {
		// Check type aliases and interfaces for redundant JSDoc
		if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
			const comments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);
			if (comments) {
				for (const comment of comments) {
					const commentText = fullText.slice(comment.pos, comment.end);

					// Check if it's a JSDoc comment
					if (commentText.startsWith("/**")) {
						const typeName = node.name.text.toLowerCase();

						// Patterns that indicate restating the type
						const redundantPatterns = [
							new RegExp(`@description\\s+${typeName}`, "i"),
							new RegExp(`represents\\s+(a\\s+)?${typeName}`, "i"),
							new RegExp(`the\\s+${typeName}\\s+type`, "i"),
							new RegExp(`a\\s+${typeName}\\s+value`, "i"),
							/^\/\*\*\s*\n\s*\*\s*\w+\s*\n\s*\*\/$/m, // Just the type name
						];

						const isRedundant = redundantPatterns.some((p) =>
							p.test(commentText),
						);

						// Also check for comments that just say "Type for X" or "Interface for X"
						if (
							isRedundant ||
							/\/\*\*\s*\n?\s*\*?\s*(type|interface)\s+(for|of)\s+/i.test(
								commentText,
							)
						) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(comment.pos);
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
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
