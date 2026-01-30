/**
 * rule-007: naming-over-commenting
 *
 * Rule: Never add comments that could be replaced by better variable or function names
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "comments",
	name: "naming-over-commenting",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Patterns that indicate obvious/redundant comments
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

			for (const pattern of obviousCommentPatterns) {
				if (pattern.test(commentText)) {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
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
		}
	};

	const visit = (node: ts.Node) => {
		scanComments(node.getFullStart());
		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
