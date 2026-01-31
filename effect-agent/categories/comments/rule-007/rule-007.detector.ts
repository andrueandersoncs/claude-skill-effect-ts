/**
 * rule-007: naming-over-commenting
 *
 * Rule: Never add comments that could be replaced by better variable or function names
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

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

	// Patterns that indicate comments compensating for poor naming
	// These comments describe WHAT a variable/function is, which should be in the name
	const namingCommentPatterns = [
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
		// Comments that describe what a variable contains (should be in the name)
		/\/\/\s*\w+\s+who\s+(have|has|are|is)\s+/i, // "Users who have admin privileges"
		/\/\/\s*\w+\s+that\s+(have|has|are|is|contain)/i, // "Items that are active"
		/\/\/\s*\w+\s+with\s+/i, // "Users with permissions"
		/\/\/\s*(all|the|list of)\s+\w+\s+(who|that|with|from)/i, // "All users who..."
		/\/\/\s*filtered\s+\w+/i, // "Filtered users"
		/\/\/\s*sorted\s+\w+/i, // "Sorted items"
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

			for (const pattern of namingCommentPatterns) {
				if (pattern.test(commentText)) {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Comment describes obvious code behavior; code should be self-documenting",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
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
