/**
 * rule-005: function-implementation
 *
 * Rule: Never add comments describing WHAT code does; the code itself shows that
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "comments",
	name: "function-implementation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Patterns that indicate "what" comments (describing what code does)
	const whatPatterns = [
		/\/\/\s*(get|set|create|make|build|return|call|invoke|execute|run|do|perform)\s+(the|a|an)?\s*\w+/i,
		/\/\/\s*(increment|decrement|add|subtract|multiply|divide)\s+(the|a)?\s*\w+/i,
		/\/\/\s*(loop|iterate|map|filter|reduce)\s+(through|over|the)\s*/i,
		/\/\/\s*(check|validate|verify)\s+(if|that|the)\s*/i,
		/\/\/\s*(assign|set)\s+\w+\s+to\s+/i,
		/\/\/\s*(initialize|init)\s+(the|a)?\s*\w+/i,
		/\/\/\s*(update|modify|change)\s+(the|a)?\s*\w+/i,
		/\/\/\s*(save|store|persist)\s+(the|a)?\s*\w+/i,
		/\/\/\s*(load|fetch|retrieve|read)\s+(the|a)?\s*\w+/i,
		/\/\/\s*(convert|transform|parse)\s+(the|a)?\s*\w+/i,
	];

	const scanComments = (pos: number) => {
		const comments = ts.getLeadingCommentRanges(fullText, pos) || [];

		for (const comment of comments) {
			if (comment.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
				const commentText = fullText.slice(comment.pos, comment.end);

				for (const pattern of whatPatterns) {
					if (pattern.test(commentText)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Comment describes WHAT code does; code should be self-documenting",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Remove comment; use clear naming so the code explains itself",
						});
						break;
					}
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
