/**
 * rule-013: unused-variable
 *
 * Rule: Never use eslint-disable comments; fix the underlying issue
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "code-style",
	name: "unused-variable",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();
	const seenPositions = new Set<number>();

	// Patterns for eslint-disable comments that suppress unused variable warnings
	const eslintDisablePatterns = [
		/eslint-disable(?:-next-line|-line)?\s+(?:@typescript-eslint\/)?no-unused-vars/,
		/eslint-disable(?:-next-line|-line)?\s+.*(?:@typescript-eslint\/)?no-unused-vars/,
	];

	// Get all comments in the file
	const scanComments = (pos: number) => {
		const leadingComments = ts.getLeadingCommentRanges(fullText, pos) || [];
		const trailingComments = ts.getTrailingCommentRanges(fullText, pos) || [];

		for (const comment of [...leadingComments, ...trailingComments]) {
			// Skip already processed comments
			if (seenPositions.has(comment.pos)) continue;
			seenPositions.add(comment.pos);

			const commentText = fullText.slice(comment.pos, comment.end);

			for (const pattern of eslintDisablePatterns) {
				if (pattern.test(commentText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"eslint-disable comment suppresses unused variable warning; fix the underlying issue instead",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
						certainty: "definite",
						suggestion:
							"Remove the unused variable or use it in your code; avoid suppressing lint errors",
					});
					break; // Only report once per comment
				}
			}
		}
	};

	const visit = (node: ts.Node) => {
		scanComments(node.getFullStart());
		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
