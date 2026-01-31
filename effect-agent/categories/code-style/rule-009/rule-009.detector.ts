/**
 * rule-009: fix-types
 *
 * Rule: Never suppress type errors with comments; fix the types
 *
 * This rule detects @ts-expect-error, @ts-expect-error, and @ts-nocheck comments
 * used to suppress GENERAL type errors like:
 * - Type mismatches (assigning wrong types)
 * - Property does not exist errors
 * - Argument type errors
 * - Return type errors
 *
 * This rule EXCLUDES exhaustiveness-related suppressions, which are handled
 * by rule-007 (exhaustive-match).
 */

import type * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "code-style",
	name: "fix-types",
};

// Patterns that suggest exhaustiveness-related context (handled by rule-007)
const exhaustivenessPatterns = [
	/switch\s*\(/i,
	/case\s+/i,
	/default\s*:/i,
	/exhaustive/i,
	/Match\./i,
	/never\s+type/i,
	/unreachable/i,
];

/**
 * Check if a comment is in an exhaustiveness-related context
 * by examining surrounding lines
 */
const isExhaustivenessContext = (
	fullText: string,
	commentPos: number,
): boolean => {
	// Get context around the comment (5 lines before and after)
	const linesBefore = 5;
	const linesAfter = 5;

	let contextStart = commentPos;
	let newlineCount = 0;
	while (contextStart > 0 && newlineCount < linesBefore) {
		contextStart--;
		if (fullText[contextStart] === "\n") newlineCount++;
	}

	let contextEnd = commentPos;
	newlineCount = 0;
	while (contextEnd < fullText.length && newlineCount < linesAfter) {
		contextEnd++;
		if (fullText[contextEnd] === "\n") newlineCount++;
	}

	const context = fullText.slice(contextStart, contextEnd);

	return exhaustivenessPatterns.some((pattern) => pattern.test(context));
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Detect @ts-expect-error and @ts-expect-error comments
	const tsIgnoreRegex = /@ts-ignore|@ts-expect-error/g;
	let ignoreMatch = tsIgnoreRegex.exec(fullText);

	while (ignoreMatch !== null) {
		const pos = ignoreMatch.index;

		// Skip if this is in an exhaustiveness context (handled by rule-007)
		if (!isExhaustivenessContext(fullText, pos)) {
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
				message: `Type error suppression '${ignoreMatch[0]}' hides type mismatch; fix the types instead`,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: lineText.slice(0, SNIPPET_MAX_LENGTH),
				severity: "error",
				certainty: "definite",
				suggestion:
					"Fix the underlying type error: use Schema.decodeUnknown for unknown data, narrow types with guards, or correct the type annotations",
			});
		}
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
