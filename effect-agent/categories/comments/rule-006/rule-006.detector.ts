/**
 * rule-006: legitimate-why-comment
 *
 * Rule: Only add comments explaining WHY when the reason isn't obvious from context
 *
 * This detector flags comments that appear to explain "why" but where the
 * reason might already be obvious from context (e.g., obvious workarounds).
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "comments",
	name: "legitimate-why-comment",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Patterns that might indicate redundant "why" comments
	const redundantWhyPatterns = [
		/\/\/\s*(this is )?(because|since|as)\s+(we need|it's required|it is required)/i,
		/\/\/\s*(we|i)\s+(need|have)\s+to\s+do\s+this\s+(because|to)/i,
		/\/\/\s*workaround\s*$/i, // Just "workaround" without explanation
		/\/\/\s*hack\s*$/i, // Just "hack" without explanation
		/\/\/\s*fix(ed)?\s*$/i, // Just "fix" without explanation
		/\/\/\s*todo:?\s*$/i, // Empty TODO
		/\/\/\s*fixme:?\s*$/i, // Empty FIXME
	];

	const scanComments = (pos: number) => {
		const comments = ts.getLeadingCommentRanges(fullText, pos) || [];

		for (const comment of comments) {
			if (comment.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
				const commentText = fullText.slice(comment.pos, comment.end);

				for (const pattern of redundantWhyPatterns) {
					if (pattern.test(commentText)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Comment lacks specific context; WHY comments should explain non-obvious reasons",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Either remove comment or add specific context (e.g., link to issue, specific constraint)",
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
