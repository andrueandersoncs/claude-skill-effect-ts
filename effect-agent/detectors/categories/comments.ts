/**
 * Comments detector
 *
 * Detects comment patterns that violate Effect-TS conventions
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const commentsDetector: CategoryDetector = {
	category: "comments",
	description: "Detects unnecessary or problematic comment patterns",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const fullText = sourceFile.getFullText();

		// Patterns that indicate problematic comments
		const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG):/i;
		const obviousCommentPatterns = [
			/\/\/\s*increment\s+/i,
			/\/\/\s*decrement\s+/i,
			/\/\/\s*add\s+\d+\s+to/i,
			/\/\/\s*subtract\s+/i,
			/\/\/\s*return\s+/i,
			/\/\/\s*set\s+.*\s+to\s+/i,
			/\/\/\s*call\s+/i,
			/\/\/\s*check\s+if\s+/i,
			/\/\/\s*loop\s+(through|over)/i,
			/\/\/\s*iterate\s+/i,
			/\/\/\s*import\s+/i,
			/\/\/\s*declare\s+/i,
			/\/\/\s*create\s+(a\s+)?(new\s+)?variable/i,
			/\/\/\s*initialize\s+/i,
		];

		// Effect-specific patterns that don't need comments
		const effectPatternsNoComment = [
			/\/\/\s*pipe\s+/i,
			/\/\/\s*map\s+(the\s+)?/i,
			/\/\/\s*flatMap\s+/i,
			/\/\/\s*Effect\.gen/i,
			/\/\/\s*yield\*/i,
			/\/\/\s*Effect\.(succeed|fail|sync|async)/i,
		];

		const scanComments = (pos: number) => {
			const comments = [
				...(ts.getLeadingCommentRanges(fullText, pos) || []),
				...(ts.getTrailingCommentRanges(fullText, pos) || []),
			];

			for (const comment of comments) {
				const commentText = fullText.slice(comment.pos, comment.end);
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					comment.pos,
				);

				// Check for TODO/FIXME comments
				if (todoPattern.test(commentText)) {
					violations.push({
						ruleId: "todo-comments",
						category: "comments",
						message:
							"TODO/FIXME comments should be tracked in issue tracker, not code",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, 80),
						severity: "warning",
						certainty: "definite",
						suggestion:
							"Create an issue/ticket and remove the comment, or fix the issue now",
					});
				}

				// Check for obvious/redundant comments
				for (const pattern of obviousCommentPatterns) {
					if (pattern.test(commentText)) {
						violations.push({
							ruleId: "naming-over-commenting",
							category: "comments",
							message:
								"Comment describes obvious code behavior; code should be self-documenting",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion: "Use clear naming instead of explanatory comments",
						});
						break;
					}
				}

				// Check for comments explaining Effect patterns
				for (const pattern of effectPatternsNoComment) {
					if (pattern.test(commentText)) {
						violations.push({
							ruleId: "effect-pipeline",
							category: "comments",
							message:
								"Effect patterns are self-documenting; comment may be unnecessary",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Effect pipelines express intent clearly; remove redundant comments",
						});
						break;
					}
				}

				// Check for commented-out code
				const codePatterns = [
					/\/\/\s*(const|let|var|function|class|interface|type|import|export)\s+/,
					/\/\/\s*return\s+[^;]+;/,
					/\/\/\s*\w+\s*=\s*[^;]+;/,
					/\/\/\s*\w+\([^)]*\);/,
				];

				for (const pattern of codePatterns) {
					if (pattern.test(commentText)) {
						violations.push({
							ruleId: "code-organization",
							category: "comments",
							message:
								"Commented-out code should be removed; use version control instead",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, 80),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Delete commented code; git history preserves old code if needed",
						});
						break;
					}
				}
			}
		};

		const visit = (node: ts.Node) => {
			scanComments(node.getFullStart());

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
									ruleId: "function-documentation",
									category: "comments",
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

		// Also scan trailing comments at end of file
		const lastToken = sourceFile.endOfFileToken;
		scanComments(lastToken.getFullStart());

		return violations;
	},
};
