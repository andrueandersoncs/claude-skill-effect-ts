/**
 * rule-009: fix-types
 *
 * Rule: Never suppress type errors with comments; fix the types
 */

import type * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "code-style",
	name: "fix-types",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Detect @ts-expect-error and @ts-ignore comments
	const tsIgnoreRegex = /@ts-ignore|@ts-expect-error/g;
	let ignoreMatch = tsIgnoreRegex.exec(fullText);

	while (ignoreMatch !== null) {
		const pos = ignoreMatch.index;
		const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

		// Get the line text for context
		const lineStart = fullText.lastIndexOf("\n", pos) + 1;
		const lineEnd = fullText.indexOf("\n", pos);
		const lineText = fullText
			.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
			.trim();

		violations.push({
			ruleId: meta.id,
			category: meta.category,
			message: `Type error suppression comment '${ignoreMatch[0]}'; fix the types instead`,
			filePath,
			line: line + 1,
			column: character + 1,
			snippet: lineText.slice(0, 80),
			severity: "error",
			certainty: "definite",
			suggestion:
				"Fix the underlying type error instead of suppressing it with comments",
		});
		ignoreMatch = tsIgnoreRegex.exec(fullText);
	}

	// Also detect @ts-nocheck at file level
	const tsNocheckRegex = /@ts-nocheck/g;
	let nocheckMatch = tsNocheckRegex.exec(fullText);

	while (nocheckMatch !== null) {
		const pos = nocheckMatch.index;
		const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);

		violations.push({
			ruleId: meta.id,
			category: meta.category,
			message: "@ts-nocheck disables all type checking; fix the types instead",
			filePath,
			line: line + 1,
			column: character + 1,
			snippet: "@ts-nocheck",
			severity: "error",
			certainty: "definite",
			suggestion: "Remove @ts-nocheck and fix all type errors in this file",
		});
		nocheckMatch = tsNocheckRegex.exec(fullText);
	}

	return violations;
};
