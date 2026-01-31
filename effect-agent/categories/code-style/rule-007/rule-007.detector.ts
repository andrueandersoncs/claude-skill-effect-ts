/**
 * rule-007: exhaustive-match
 *
 * Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
 *
 * This detector specifically targets eslint-disable comments and type suppressions
 * that are used to bypass exhaustiveness checking, such as:
 * - @typescript-eslint/switch-exhaustiveness-check
 * - @typescript-eslint/no-unnecessary-condition (often used on default cases)
 * - noFallthroughCasesInSwitch related suppressions
 * - @ts-expect-error / @ts-expect-error on switch statements with "not all code paths return"
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "code-style",
	name: "exhaustive-match",
};

// Patterns that indicate exhaustiveness-related suppressions
const EXHAUSTIVENESS_PATTERNS = [
	// ESLint rules related to exhaustiveness
	"switch-exhaustiveness-check",
	"@typescript-eslint/switch-exhaustiveness",

	// Common suppressions used to bypass exhaustive switch checking
	"no-unnecessary-condition",

	// TypeScript error codes related to exhaustiveness
	"ts7030", // Not all code paths return a value
	"ts2339", // Property does not exist (on never type in exhaustive checks)

	// Text patterns indicating exhaustiveness bypass
	"not all code paths return",
	"unreachable default",
	"never type",
];

/**
 * Check if a comment is specifically related to exhaustiveness checking.
 * We look for specific eslint rules and TypeScript error codes.
 */
const isExhaustivenessRelated = (commentText: string): boolean => {
	const lowerComment = commentText.toLowerCase();
	return EXHAUSTIVENESS_PATTERNS.some((pattern) =>
		lowerComment.includes(pattern.toLowerCase()),
	);
};

/**
 * Check if a comment is an actual suppression directive (not just a mention).
 * Must start with the suppression pattern or be a line starting with it.
 */
const isSuppressionDirective = (commentText: string): boolean => {
	const trimmed = commentText.trim();

	// Match actual eslint-disable directives
	const eslintDisablePattern =
		/^\s*\/[/*]\s*eslint-disable(?:-next-line|-line)?/;
	// Match actual @ts-expect-error/@ts-expect-error directives
	const tsSuppressionPattern = /^\s*\/[/*]\s*@ts-(?:ignore|expect-error)/;

	return (
		eslintDisablePattern.test(trimmed) || tsSuppressionPattern.test(trimmed)
	);
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();
	const reportedPositions = new Set<number>();

	const visit = (node: ts.Node) => {
		const leadingComments = ts.getLeadingCommentRanges(
			fullText,
			node.getFullStart(),
		);

		if (leadingComments) {
			for (const comment of leadingComments) {
				// Skip already-reported comments (deduplication)
				if (reportedPositions.has(comment.pos)) {
					continue;
				}

				const commentText = fullText.slice(comment.pos, comment.end);

				// Only flag if it's an actual suppression directive AND related to exhaustiveness
				if (
					isSuppressionDirective(commentText) &&
					isExhaustivenessRelated(commentText)
				) {
					reportedPositions.add(comment.pos);
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Suppression comment used to bypass exhaustiveness check; use Match.exhaustive instead",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Replace switch with Match.type().pipe(..., Match.exhaustive) for compile-time exhaustiveness",
					});
				}
			}
		}

		// Also check for @ts-expect-error/@ts-expect-error directly before switch statements
		if (ts.isSwitchStatement(node)) {
			const switchLeadingComments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);

			if (switchLeadingComments) {
				for (const comment of switchLeadingComments) {
					// Skip already-reported comments
					if (reportedPositions.has(comment.pos)) {
						continue;
					}

					const commentText = fullText.slice(comment.pos, comment.end);
					// Flag ts-ignore/ts-expect-error on switch statements as potential exhaustiveness bypasses
					if (
						isSuppressionDirective(commentText) &&
						(commentText.includes("@ts-ignore") ||
							commentText.includes("@ts-expect-error")) &&
						!isExhaustivenessRelated(commentText)
					) {
						reportedPositions.add(comment.pos);
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Type suppression on switch statement may be bypassing exhaustiveness check",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Consider using Match.type().pipe(..., Match.exhaustive) for type-safe exhaustive matching",
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
