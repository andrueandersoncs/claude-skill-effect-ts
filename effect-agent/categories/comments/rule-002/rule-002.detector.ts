/**
 * rule-002: code-organization
 *
 * Rule: Never add section marker comments; use file organization and clear naming instead
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "comments",
	name: "code-organization",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Check for commented-out code
	const codePatterns = [
		/\/\/\s*(const|let|var|function|class|interface|type|import|export)\s+/,
		/\/\/\s*return\s+[^;]+;/,
		/\/\/\s*\w+\s*=\s*[^;]+;/,
		/\/\/\s*\w+\([^)]*\);/,
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

			for (const pattern of codePatterns) {
				if (pattern.test(commentText)) {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
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
		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	// Also scan trailing comments at end of file
	const lastToken = sourceFile.endOfFileToken;
	scanComments(lastToken.getFullStart());

	return violations;
};
