/**
 * rule-001: self-documenting-code
 *
 * Rule: Never add comments that merely restate what the code already expresses;
 * Effect-TS code is self-documenting through types, pipelines, and clear naming.
 * Comments should be a LAST RESORT and only explain WHY, never WHAT.
 */

import * as ts from "typescript";
import {
	CommentsViolation,
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "comments",
	name: "self-documenting-code",
};

// ============================================================
// Utility: Check if comment text is just an identifier expanded to prose
// ============================================================
const identifierToWords = (identifier: string): string[] => {
	// Convert camelCase/PascalCase to words: "ruleId" -> ["rule", "id"]
	return identifier
		.replace(/([A-Z])/g, " $1")
		.toLowerCase()
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0);
};

const isExpandedIdentifier = (
	comment: string,
	identifier: string,
	contextWords: string[] = [],
): boolean => {
	// Normalize comment: remove articles, punctuation, lowercase
	const normalized = comment
		.toLowerCase()
		.replace(/[/*@{}[\]().,;:!?'"]/g, " ")
		.replace(
			/\b(a|an|the|of|to|for|that|which|is|are|was|were|be|been|being|it|its|this|these|those)\b/g,
			" ",
		)
		.replace(/\s+/g, " ")
		.trim();

	const commentWords = normalized.split(" ").filter((w) => w.length > 1);
	const idWords = identifierToWords(identifier);

	// All identifier words present in comment?
	const idWordsInComment = idWords.filter((w) =>
		commentWords.some((cw) => cw.includes(w) || w.includes(cw)),
	);

	// If comment is mostly identifier words + context words, it's redundant
	const meaningfulWords = commentWords.filter(
		(w) =>
			!idWords.some((iw) => w.includes(iw) || iw.includes(w)) &&
			!contextWords.some((cw) => w.includes(cw) || cw.includes(w)) &&
			![
				"number",
				"string",
				"boolean",
				"value",
				"property",
				"field",
				"param",
				"parameter",
				"returns",
				"return",
				"type",
				"where",
				"when",
				"found",
				"index",
				"indexed",
			].includes(w),
	);

	// If most identifier words are present and few meaningful words remain, it's redundant
	return (
		idWordsInComment.length >= idWords.length * 0.6 &&
		meaningfulWords.length <= 2
	);
};

// ============================================================
// Utility: Extract context words from scope
// ============================================================
const getContextWords = (
	node: ts.Node,
	sourceFile: ts.SourceFile,
): string[] => {
	const words: string[] = [];
	let current: ts.Node | undefined = node;

	while (current) {
		if (
			ts.isFunctionDeclaration(current) ||
			ts.isMethodDeclaration(current) ||
			ts.isArrowFunction(current)
		) {
			const name =
				ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)
					? current.name?.getText(sourceFile)
					: undefined;
			if (name) words.push(...identifierToWords(name));
		}
		if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
			words.push(...identifierToWords(current.name.text));
		}
		if (ts.isClassDeclaration(current) && current.name) {
			words.push(...identifierToWords(current.name.text));
		}
		if (ts.isInterfaceDeclaration(current)) {
			words.push(...identifierToWords(current.name.text));
		}
		if (ts.isTypeAliasDeclaration(current)) {
			words.push(...identifierToWords(current.name.text));
		}
		current = current.parent;
	}

	return words;
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	const addViolation = (
		pos: number,
		message: string,
		snippet: string,
		suggestion: string,
	) => {
		const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
		violations.push(
			new CommentsViolation({
				category: "comments",
				ruleId: meta.id,
				message,
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: snippet.slice(0, SNIPPET_MAX_LENGTH),
				certainty: "potential",
				suggestion,
			}),
		);
	};

	// ============================================================
	// Pattern: WHAT comments in any format
	// ============================================================
	const whatPatterns = [
		/^\/\/\s*(get|set|create|make|build|return|call|invoke|execute|run|do|perform|fetch|load|save|store|read|write)\s+(the|a|an)?\s*\w*/i,
		/^\/\/\s*(increment|decrement|add|subtract|multiply|divide)\s+(the|a)?\s*\w*/i,
		/^\/\/\s*(loop|iterate|map|filter|reduce)\s+(through|over|the)\s*/i,
		/^\/\/\s*(check|validate|verify|test)\s+(if|that|the|whether)\s*/i,
		/^\/\/\s*(assign|set)\s+\w+\s+to\s+/i,
		/^\/\/\s*(initialize|init)\s+(the|a)?\s*\w*/i,
		/^\/\/\s*(update|modify|change)\s+(the|a)?\s*\w*/i,
		/^\/\/\s*(convert|transform|parse|process)\s+(the|a)?\s*\w*/i,
		/^\/\/\s*(calculate|compute|determine)\s+(the|a)?\s*\w*/i,
		/^\/\/\s*(handle|process)\s+(the|a)?\s*(error|result|response|request)/i,
	];

	// Patterns for multi-line /* */ comments
	const whatPatternsMultiLine = [
		/(get|set|create|make|build|return|fetch|load|save|store|read|write)s?\s+(the|a|an)?\s*\w+/i,
		/(loop|iterate|map|filter|reduce)s?\s+(through|over|the)/i,
		/(check|validate|verify|test)s?\s+(if|that|the|whether)/i,
		/(calculate|compute|determine)s?\s+(the|a)?\s*\w+/i,
		/(initialize|init|setup|set up)s?\s+(the|a)?\s*\w+/i,
		/(update|modify|change)s?\s+(the|a)?\s*\w+/i,
		/(convert|transform|parse|process)s?\s+(the|a)?\s*\w+/i,
	];

	const isWhatComment = (commentText: string): boolean => {
		// Single line //
		if (commentText.startsWith("//")) {
			return whatPatterns.some((p) => p.test(commentText));
		}
		// Multi-line /* */ or JSDoc /** */
		if (commentText.startsWith("/*")) {
			const content = commentText
				.replace(/^\/\*+|\*+\/$|^\s*\*\s*/gm, " ")
				.trim();
			// Short descriptions that match WHAT patterns
			if (content.length < 150) {
				return whatPatternsMultiLine.some((p) => p.test(content));
			}
		}
		return false;
	};

	// ============================================================
	// Check comments on any node
	// ============================================================
	const checkNodeComments = (node: ts.Node, identifier?: string) => {
		const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
		if (!comments) return;

		const contextWords = getContextWords(node, sourceFile);

		for (const comment of comments) {
			const commentText = fullText.slice(comment.pos, comment.end);

			// Skip legitimate WHY indicators
			if (
				/\b(because|since|workaround|hack|todo|fixme|note|warning|legacy|required by|must be|cannot|due to|reason|why)\b/i.test(
					commentText,
				)
			) {
				continue;
			}

			// Check WHAT patterns
			if (isWhatComment(commentText)) {
				addViolation(
					comment.pos,
					"Comment describes WHAT code does; code should be self-documenting",
					commentText,
					"Remove comment; improve naming or structure so the code explains itself",
				);
				continue;
			}

			// Check if JSDoc/comment just expands an identifier
			if (identifier && commentText.startsWith("/*")) {
				const content = commentText
					.replace(/^\/\*+|\*+\/$|^\s*\*\s*/gm, " ")
					.trim();

				// Skip @param, @returns style docs for now (handled separately)
				if (/@(param|returns?|throws?|example|see|deprecated)/i.test(content)) {
					continue;
				}

				if (
					content.length < 200 &&
					isExpandedIdentifier(content, identifier, contextWords)
				) {
					addViolation(
						comment.pos,
						`Comment restates what '${identifier}' already expresses; code is self-documenting`,
						commentText,
						"Remove redundant comment; the identifier and context are sufficient",
					);
				}
			}
		}
	};

	// ============================================================
	// AST Visitor
	// ============================================================
	const visit = (node: ts.Node) => {
		// Object literal properties: { /** comment */ propName: value }
		if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
			checkNodeComments(node, node.name.text);
		}

		// Shorthand properties: { /** comment */ propName }
		if (ts.isShorthandPropertyAssignment(node)) {
			checkNodeComments(node, node.name.text);
		}

		// Interface/type properties: interface X { /** comment */ prop: Type }
		if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
			checkNodeComments(node, node.name.text);
		}

		// Class properties
		if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
			checkNodeComments(node, node.name.text);
		}

		// Variable declarations: /** comment */ const x = ...
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) {
					checkNodeComments(node, decl.name.text);
				}
			}
		}

		// Function declarations: /** comment */ function name() {}
		if (ts.isFunctionDeclaration(node) && node.name) {
			checkNodeComments(node, node.name.text);
		}

		// Type alias: /** comment */ type X = ...
		if (ts.isTypeAliasDeclaration(node)) {
			checkNodeComments(node, node.name.text);
		}

		// Interface: /** comment */ interface X {}
		if (ts.isInterfaceDeclaration(node)) {
			checkNodeComments(node, node.name.text);
		}

		// Class: /** comment */ class X {}
		if (ts.isClassDeclaration(node) && node.name) {
			checkNodeComments(node, node.name.text);
		}

		// Method declarations
		if (
			ts.isMethodDeclaration(node) &&
			node.name &&
			ts.isIdentifier(node.name)
		) {
			checkNodeComments(node, node.name.text);
		}

		// Any other node - check for standalone WHAT comments
		const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
		if (comments) {
			for (const comment of comments) {
				const commentText = fullText.slice(comment.pos, comment.end);

				// Skip if we already would have checked this via a more specific pattern
				if (
					ts.isPropertyAssignment(node) ||
					ts.isPropertySignature(node) ||
					ts.isVariableStatement(node) ||
					ts.isFunctionDeclaration(node) ||
					ts.isMethodDeclaration(node)
				) {
					continue;
				}

				// Skip WHY indicators
				if (
					/\b(because|since|workaround|hack|todo|fixme|note|warning|legacy|required by|must be|cannot|due to|reason|why)\b/i.test(
						commentText,
					)
				) {
					continue;
				}

				if (isWhatComment(commentText)) {
					addViolation(
						comment.pos,
						"Comment describes WHAT code does; code should be self-documenting",
						commentText,
						"Remove comment; improve naming or structure so the code explains itself",
					);
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
