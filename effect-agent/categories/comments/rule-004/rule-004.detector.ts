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

	// Check for redundant @param/@returns JSDoc tags
	const checkForRedundantJSDoc = (
		node: ts.Node,
		funcName: string | undefined,
	) => {
		const fullText = sourceFile.getFullText();
		const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());

		if (!comments) return;

		for (const comment of comments) {
			const commentText = fullText.slice(comment.pos, comment.end);

			// Only check JSDoc comments
			if (!commentText.startsWith("/**")) continue;

			// Check for @param tags that just restate parameter name/type
			const paramMatches = commentText.matchAll(
				/@param\s+(\w+)\s*-?\s*([^\n@]*)/g,
			);
			for (const match of paramMatches) {
				const paramName = match[1].toLowerCase();
				const paramDesc = match[2].toLowerCase().trim();

				// Check if description just says "the <param>" or "a <param>"
				if (
					paramDesc === `the ${paramName}` ||
					paramDesc === `a ${paramName}` ||
					paramDesc === `the ${paramName} parameter` ||
					paramDesc === paramName ||
					new RegExp(`^the\\s+${paramName}\\s+of\\s+the\\s+\\w+$`).test(
						paramDesc,
					)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `@param ${match[1]} just restates parameter name; add meaningful description or remove`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: match[0].trim().slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Document what the parameter is used for, constraints, or examples",
					});
				}
			}

			// Check for @returns that just says "the created/returned X"
			const returnsMatch = commentText.match(/@returns?\s+([^\n@]*)/);
			if (returnsMatch) {
				const returnsDesc = returnsMatch[1].toLowerCase().trim();
				if (
					/^the\s+(created|returned|result|value|data|response)\s*\w*$/.test(
						returnsDesc,
					) ||
					/^(a|the)\s+\w+$/.test(returnsDesc)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"@returns just restates return type; add meaningful description or remove",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: returnsMatch[0].trim().slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Document what conditions affect the return value or its structure",
					});
				}
			}

			// Check if main description just restates function name
			if (funcName) {
				// Extract main description (before @tags)
				const mainDescMatch = commentText.match(
					/\/\*\*\s*\n?\s*\*?\s*([^@\n][^\n@]*)/,
				);
				if (mainDescMatch) {
					const mainDesc = mainDescMatch[1].trim().toLowerCase();

					// Check if description is just "Creates a user" for "createUser"
					const descWords = mainDesc.replace(/[^a-z\s]/g, "").split(/\s+/);
					const nameWords = funcName
						.replace(/([A-Z])/g, " $1")
						.toLowerCase()
						.trim()
						.split(/\s+/);

					const overlap = descWords.filter((w) =>
						nameWords.some((nw) => nw.includes(w) || w.includes(nw)),
					);
					if (overlap.length >= nameWords.length - 1 && mainDesc.length < 50) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"JSDoc description just restates function name; document the 'why', not 'what'",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: mainDesc.slice(0, 60),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Document purpose, edge cases, or business context instead",
						});
					}
				}
			}
		}
	};

	const visit = (node: ts.Node) => {
		// Check function declarations and methods
		if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
			checkForRedundantJSDoc(node, node.name?.getText(sourceFile));
		}

		// Check variable statements with arrow functions
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (
					ts.isIdentifier(decl.name) &&
					decl.initializer &&
					ts.isArrowFunction(decl.initializer)
				) {
					checkForRedundantJSDoc(node, decl.name.getText(sourceFile));
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
