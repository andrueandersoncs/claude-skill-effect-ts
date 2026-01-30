/**
 * Code style detector
 *
 * Detects style issues like non-null assertions, function keyword, type casts, etc.
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const codeStyleDetector: CategoryDetector = {
	category: "code-style",
	description:
		"Detects style issues like non-null assertions, type casts, etc.",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect non-null assertions (!)
			if (ts.isNonNullExpression(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "non-null-assertion",
					category: "code-style",
					message:
						"Non-null assertion (!) should be replaced with Option or Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use Option.fromNullable() with Option.match() or Effect error handling",
				});
			}

			// Detect type assertions (as)
			if (ts.isAsExpression(node)) {
				const typeText = node.type.getText(sourceFile);

				// as any or as unknown are particularly bad
				if (typeText === "any" || typeText === "unknown") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "unknown-conversion",
						category: "code-style",
						message: `Type assertion 'as ${typeText}' should be replaced with Schema validation`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Schema.decodeUnknown() for type-safe validation",
					});
				} else {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "fix-types",
						category: "code-style",
						message:
							"Type assertions may hide type errors; consider Schema validation",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Consider using Schema validation or fixing the types at source",
					});
				}
			}

			// Detect angle-bracket type assertions (<Type>expr)
			if (ts.isTypeAssertionExpression(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "fix-types",
					category: "code-style",
					message:
						"Type assertions may hide type errors; consider Schema validation",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Consider using Schema validation or fixing the types at source",
				});
			}

			// Detect function declarations (should use arrow functions)
			if (ts.isFunctionDeclaration(node) && node.name) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "fat-arrow-syntax",
					category: "code-style",
					message: "Function declarations should use arrow function syntax",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: `Convert to: const ${node.name.text} = (...) => { ... }`,
				});
			}

			// Detect function expressions (should use arrow functions)
			if (ts.isFunctionExpression(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "fat-arrow-syntax",
					category: "code-style",
					message: "Function expressions should use arrow function syntax",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion: "Convert to arrow function: (...) => { ... }",
				});
			}

			// Detect eslint-disable comments
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
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(comment.pos);
						violations.push({
							ruleId: "exhaustive-match",
							category: "code-style",
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

			// Detect 'any' type annotations
			if (ts.isTypeReferenceNode(node)) {
				const typeName = node.typeName.getText(sourceFile);
				if (typeName === "any") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "fix-types",
						category: "code-style",
						message:
							"'any' type should be replaced with proper typing or Schema",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.parent.getText(sourceFile).slice(0, 80),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Schema validation or explicit types",
					});
				}
			}

			// Detect ': any' in parameter/variable declarations
			if (
				(ts.isParameter(node) || ts.isVariableDeclaration(node)) &&
				node.type
			) {
				if (node.type.kind === ts.SyntaxKind.AnyKeyword) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "fix-types",
						category: "code-style",
						message:
							"'any' type annotation should be replaced with proper typing",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Schema validation or explicit types",
					});
				}
			}

			// Detect dynamic property access obj[key] (should use Struct module)
			if (
				ts.isElementAccessExpression(node) &&
				!ts.isNumericLiteral(node.argumentExpression) &&
				!ts.isStringLiteral(node.argumentExpression)
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "dynamic-property-access",
					category: "code-style",
					message:
						"Dynamic property access may be unsafe; consider Struct.get()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Use Struct.get() or Record.get() for safe property access",
				});
			}

			// Detect unused variables (underscore prefix or _unused pattern)
			if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
				const name = node.name.text;
				// Skip if it's a destructuring ignore pattern
				if (name.startsWith("_") && name !== "_" && !name.startsWith("__")) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "unused-variable",
						category: "code-style",
						message:
							"Variable prefixed with underscore may indicate unused value",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion: "Remove unused variables or use them",
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
