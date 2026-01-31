/**
 * rule-003: eslint-disable-any-type
 *
 * Rule: Never use eslint-disable for any-type errors; use Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "code-style",
	name: "eslint-disable-any-type",
};

// ESLint rules related to 'any' type that should not be disabled
const ANY_TYPE_RULES = [
	"@typescript-eslint/no-explicit-any",
	"@typescript-eslint/no-unsafe-member-access",
	"@typescript-eslint/no-unsafe-assignment",
	"@typescript-eslint/no-unsafe-call",
	"@typescript-eslint/no-unsafe-return",
	"@typescript-eslint/no-unsafe-argument",
];

// Patterns for eslint-disable comments
const ESLINT_DISABLE_PATTERNS = [
	/eslint-disable(?:-next-line|-line)?(?:\s+|$)/,
	/eslint-disable\s+/,
];

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();
	const processedPositions = new Set<number>();

	// Scan through all comments in the file
	const scanComments = (pos: number) => {
		const leadingComments = ts.getLeadingCommentRanges(fullText, pos) || [];
		const trailingComments = ts.getTrailingCommentRanges(fullText, pos) || [];
		const comments = [...leadingComments, ...trailingComments];

		for (const comment of comments) {
			// Skip already processed comments
			if (processedPositions.has(comment.pos)) continue;
			processedPositions.add(comment.pos);

			const commentText = fullText.slice(comment.pos, comment.end);

			// Check if this is an eslint-disable comment
			const isEslintDisable = ESLINT_DISABLE_PATTERNS.some((pattern) =>
				pattern.test(commentText),
			);

			if (!isEslintDisable) continue;

			// Check if it disables any of the any-type related rules
			for (const rule of ANY_TYPE_RULES) {
				if (commentText.includes(rule)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `eslint-disable for ${rule}; use Schema.decodeUnknown instead of any`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, 100),
						severity: "warning",
						certainty: "definite",
						suggestion:
							"Use Schema.decodeUnknown() to safely parse unknown data with type validation instead of disabling any-type checks",
					});
					break; // Only report once per comment even if multiple rules are disabled
				}
			}
		}
	};

	// Visit all nodes to find comments
	const visit = (node: ts.Node) => {
		scanComments(node.getFullStart());
		ts.forEachChild(node, visit);
	};

	// Also check the very beginning of the file for file-level eslint-disable
	scanComments(0);

	visit(sourceFile);
	return violations;
};
