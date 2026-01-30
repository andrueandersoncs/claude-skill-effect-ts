/**
 * rule-003: effect-pipeline
 *
 * Rule: Never add inline comments for obvious Effect patterns; Effect code is self-documenting
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "comments",
	name: "effect-pipeline",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Effect-specific patterns that don't need comments
	// These detect comments that describe obvious Effect operations
	const effectPatternsNoComment = [
		/\/\/\s*pipe\s+/i,
		/\/\/\s*map\s+(the\s+)?/i,
		/\/\/\s*flatMap\s+/i,
		/\/\/\s*Effect\.gen/i,
		/\/\/\s*yield\*/i,
		/\/\/\s*Effect\.(succeed|fail|sync|async)/i,
		// Common inline comments for obvious operations
		/\/\/\s*get\s+(the\s+)?\w+/i, // "Get the user"
		/\/\/\s*fetch\s+(the\s+)?\w+/i, // "Fetch the data"
		/\/\/\s*validate\s+(it|the|this)/i, // "Validate it"
		/\/\/\s*transform\s+(the\s+)?(result|data|response|it)/i, // "Transform the result"
		/\/\/\s*handle\s+(the\s+)?(error|result)/i, // "Handle the error"
		/\/\/\s*process\s+(the\s+)?\w+/i, // "Process the data"
		/\/\/\s*save\s+(the\s+)?\w+/i, // "Save the user"
		/\/\/\s*update\s+(the\s+)?\w+/i, // "Update the record"
		/\/\/\s*delete\s+(the\s+)?\w+/i, // "Delete the item"
		/\/\/\s*create\s+(a\s+|the\s+)?\w+/i, // "Create a user"
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

			for (const pattern of effectPatternsNoComment) {
				if (pattern.test(commentText)) {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Effect patterns are self-documenting; comment may be unnecessary",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: commentText.slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Effect pipelines express intent clearly; remove redundant comments",
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
