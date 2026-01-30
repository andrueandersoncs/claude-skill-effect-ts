/**
 * rule-007: exhaustive-match
 *
 * Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "code-style",
	name: "exhaustive-match",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect eslint-disable comments and type suppression
		const fullText = sourceFile.getFullText();
		const leadingComments = ts.getLeadingCommentRanges(
			fullText,
			node.getFullStart(),
		);

		if (leadingComments) {
			for (const comment of leadingComments) {
				const commentText = fullText.slice(comment.pos, comment.end);
				if (
					commentText.includes("eslint-disable") ||
					commentText.includes("@ts-ignore") ||
					commentText.includes("@ts-nocheck") ||
					commentText.includes("@ts-expect-error")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Lint/type suppression comments indicate underlying issues",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, 80),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Fix the underlying type/lint issue instead of suppressing",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
