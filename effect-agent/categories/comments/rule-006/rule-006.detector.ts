/**
 * rule-006: legitimate-why-comment
 *
 * Rule: Only add comments explaining WHY when the reason isn't obvious from context
 *
 * This detector flags comments that appear to explain "why" but where the
 * reason might already be obvious from context (e.g., obvious workarounds).
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

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

	// Patterns that indicate "what" comments (describing what code does, not why)
	const whatNotWhyPatterns = [
		/\/\/\s*set\s+\w+\s+to\s+/i, // "Set timeout to 30 seconds"
		/\/\/\s*assign\s+/i, // "Assign value to..."
		/\/\/\s*store\s+/i, // "Store the value"
		/\/\/\s*define\s+/i, // "Define the constant"
		/\/\/\s*declare\s+/i, // "Declare a variable"
		/\/\/\s*initialize\s+/i, // "Initialize the array"
		/\/\/\s*create\s+(a\s+|the\s+)?(new\s+)?(variable|constant|array|object|map|set)/i,
		/\/\/\s*add\s+\d+/i, // "Add 1 to..."
		/\/\/\s*increment\s+/i, // "Increment counter"
		/\/\/\s*decrement\s+/i, // "Decrement counter"
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

				for (const pattern of whatNotWhyPatterns) {
					if (pattern.test(commentText)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Comment describes 'what' not 'why'; comments should explain non-obvious reasons",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: commentText.slice(0, SNIPPET_MAX_LENGTH),
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
