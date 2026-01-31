/**
 * rule-001: self-documenting-code
 *
 * Rule: Never add comments that merely restate what the code already expresses;
 * Effect-TS code is self-documenting through types, pipelines, and clear naming
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "comments",
	name: "self-documenting-code",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// ============================================================
	// Pattern 1: Branded type definitions with redundant JSDoc
	// ============================================================
	const checkBrandedTypeJSDoc = (
		_node: ts.Node,
		typeName: string,
		comment: ts.CommentRange,
	) => {
		const commentText = fullText.slice(comment.pos, comment.end);

		if (commentText.startsWith("/**")) {
			const typeNameLower = typeName.toLowerCase();

			const redundantPatterns = [
				new RegExp(`@description\\s+${typeNameLower}`, "i"),
				new RegExp(`represents\\s+(a\\s+)?${typeNameLower}`, "i"),
				new RegExp(`the\\s+${typeNameLower}\\s+type`, "i"),
				new RegExp(`a\\s+${typeNameLower}\\s+value`, "i"),
				/^\/\*\*\s*\n\s*\*\s*\w+\s*\n\s*\*\/$/m,
				/branded\s+type\s+(for|of)\s+/i,
				/(type|interface)\s+(for|of)\s+/i,
			];

			const isRedundant = redundantPatterns.some((p) => p.test(commentText));

			if (isRedundant) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					comment.pos,
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"JSDoc comment restates type definition; types are self-documenting",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: commentText.slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Remove redundant JSDoc; branded types and interfaces are self-documenting",
				});
			}
		}
	};

	// ============================================================
	// Pattern 2: Effect pipeline comments
	// ============================================================
	const effectPatternsNoComment = [
		/\/\/\s*pipe\s+/i,
		/\/\/\s*map\s+(the\s+)?/i,
		/\/\/\s*flatMap\s+/i,
		/\/\/\s*Effect\.gen/i,
		/\/\/\s*yield\*/i,
		/\/\/\s*Effect\.(succeed|fail|sync|async)/i,
		/\/\/\s*get\s+(the\s+)?\w+/i,
		/\/\/\s*fetch\s+(the\s+)?\w+/i,
		/\/\/\s*validate\s+(it|the|this)/i,
		/\/\/\s*transform\s+(the\s+)?(result|data|response|it)/i,
		/\/\/\s*handle\s+(the\s+)?(error|result)/i,
		/\/\/\s*process\s+(the\s+)?\w+/i,
		/\/\/\s*save\s+(the\s+)?\w+/i,
		/\/\/\s*update\s+(the\s+)?\w+/i,
		/\/\/\s*delete\s+(the\s+)?\w+/i,
		/\/\/\s*create\s+(a\s+|the\s+)?\w+/i,
	];

	// ============================================================
	// Pattern 3: WHAT comments (describing what code does)
	// ============================================================
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

	// ============================================================
	// Pattern 4: Redundant @param/@returns JSDoc
	// ============================================================
	const checkRedundantFunctionJSDoc = (
		node: ts.Node,
		funcName: string | undefined,
	) => {
		const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
		if (!comments) return;

		for (const comment of comments) {
			const commentText = fullText.slice(comment.pos, comment.end);
			if (!commentText.startsWith("/**")) continue;

			// Check @param tags
			const paramMatches = commentText.matchAll(
				/@param\s+(\w+)\s*-?\s*([^\n@]*)/g,
			);
			for (const match of paramMatches) {
				const paramName = match[1].toLowerCase();
				const paramDesc = match[2].toLowerCase().trim();

				if (
					paramDesc === `the ${paramName}` ||
					paramDesc === `a ${paramName}` ||
					paramDesc === `the ${paramName} parameter` ||
					paramDesc === paramName ||
					new RegExp(`^the\\s+${paramName}\\s+of\\s+the\\s+\\w+$`).test(
						paramDesc,
					)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `@param ${match[1]} just restates parameter name; add meaningful description or remove`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: match[0].trim().slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Document what the parameter is used for, constraints, or examples",
					});
				}
			}

			// Check @returns
			const returnsMatch = commentText.match(/@returns?\s+([^\n@]*)/);
			if (returnsMatch) {
				const returnsDesc = returnsMatch[1].toLowerCase().trim();
				if (
					/^the\s+(created|returned|result|value|data|response)\s*\w*$/.test(
						returnsDesc,
					) ||
					/^(a|the)\s+\w+$/.test(returnsDesc)
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						comment.pos,
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"@returns just restates return type; add meaningful description or remove",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: returnsMatch[0].trim().slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Document what conditions affect the return value or its structure",
					});
				}
			}

			// Check if main description restates function name
			if (funcName) {
				const mainDescMatch = commentText.match(
					/\/\*\*\s*\n?\s*\*?\s*([^@\n][^\n@]*)/,
				);
				if (mainDescMatch) {
					const mainDesc = mainDescMatch[1].trim().toLowerCase();
					const descWords = mainDesc.replace(/[^a-z\s]/g, "").split(/\s+/);
					const nameWords = funcName
						.replace(/([A-Z])/g, " $1")
						.toLowerCase()
						.trim()
						.split(/\s+/);

					const overlap = descWords.filter((w) =>
						nameWords.some((nw) => nw.includes(w) || w.includes(nw)),
					);
					if (overlap.length >= nameWords.length - 1 && mainDesc.length < 50) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"JSDoc description just restates function name; document the 'why', not 'what'",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: mainDesc.slice(0, 60),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Document purpose, edge cases, or business context instead",
						});
					}
				}
			}
		}
	};

	// ============================================================
	// Scan for inline comments (Effect pipelines and WHAT comments)
	// ============================================================
	const scanInlineComments = (pos: number) => {
		const comments = [
			...(ts.getLeadingCommentRanges(fullText, pos) || []),
			...(ts.getTrailingCommentRanges(fullText, pos) || []),
		];

		for (const comment of comments) {
			const commentText = fullText.slice(comment.pos, comment.end);
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				comment.pos,
			);

			// Check Effect pipeline patterns
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
					return; // Only one violation per comment
				}
			}

			// Check WHAT patterns (only for single-line comments)
			if (comment.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
				for (const pattern of whatPatterns) {
					if (pattern.test(commentText)) {
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
						return; // Only one violation per comment
					}
				}
			}
		}
	};

	// ============================================================
	// AST Visitor
	// ============================================================
	const visit = (node: ts.Node) => {
		// Check type aliases and interfaces for redundant JSDoc (branded types)
		if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
			const comments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);
			if (comments) {
				for (const comment of comments) {
					checkBrandedTypeJSDoc(node, node.name.text, comment);
				}
			}
		}

		// Check variable declarations for branded types
		if (ts.isVariableStatement(node)) {
			const comments = ts.getLeadingCommentRanges(
				fullText,
				node.getFullStart(),
			);
			if (comments) {
				for (const decl of node.declarationList.declarations) {
					if (ts.isIdentifier(decl.name)) {
						for (const comment of comments) {
							checkBrandedTypeJSDoc(node, decl.name.text, comment);
						}
					}
				}
			}
		}

		// Check function declarations and methods for redundant JSDoc
		if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
			checkRedundantFunctionJSDoc(node, node.name?.getText(sourceFile));
		}

		// Check variable statements with arrow functions
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (
					ts.isIdentifier(decl.name) &&
					decl.initializer &&
					ts.isArrowFunction(decl.initializer)
				) {
					checkRedundantFunctionJSDoc(node, decl.name.getText(sourceFile));
				}
			}
		}

		// Scan for inline comments
		scanInlineComments(node.getFullStart());

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
