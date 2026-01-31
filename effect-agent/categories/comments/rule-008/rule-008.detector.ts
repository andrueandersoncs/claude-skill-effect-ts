/**
 * rule-008: todo-comments
 *
 * Rule: Never add TODO comments without actionable context; either fix it or remove it
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "comments",
	name: "todo-comments",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Patterns that indicate problematic comments
	const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG):/i;

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
					ruleId: meta.id,
					category: meta.category,
					message:
						"TODO/FIXME comments should be tracked in issue tracker, not code",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Create an issue/ticket and remove the comment, or fix the issue now",
				});
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
