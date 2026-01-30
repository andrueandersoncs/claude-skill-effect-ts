/**
 * Imperative code detector
 *
 * Detects loops (for, while, do-while), mutations, and imperative patterns
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const imperativeDetector: CategoryDetector = {
	category: "imperative",
	description: "Detects loops, mutations, and imperative patterns",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect for loops
			if (ts.isForStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effectful-iteration",
					category: "imperative",
					message: "Use Effect.forEach or Array methods instead of for loops",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Effect.forEach() or Array.map/filter/reduce",
				});
			}

			// Detect for...of loops
			if (ts.isForOfStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effectful-iteration",
					category: "imperative",
					message:
						"Use Effect.forEach or Array methods instead of for...of loops",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Effect.forEach() or Array.map/filter/reduce",
				});
			}

			// Detect for...in loops
			if (ts.isForInStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effectful-iteration",
					category: "imperative",
					message:
						"Use Record.toEntries or Object methods instead of for...in loops",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Replace with Record.toEntries() or Record.keys()",
				});
			}

			// Detect while loops
			if (ts.isWhileStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effectful-iteration",
					category: "imperative",
					message:
						"Use Effect.loop, Effect.iterate, or recursion instead of while loops",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Replace with Effect.loop() or recursive Effect.gen()",
				});
			}

			// Detect do...while loops
			if (ts.isDoStatement(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "effectful-iteration",
					category: "imperative",
					message: "Use Effect.loop or recursion instead of do...while loops",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Replace with Effect.loop() or recursive Effect.gen()",
				});
			}

			// Detect let declarations (potential mutation)
			if (ts.isVariableStatement(node)) {
				const declarationList = node.declarationList;
				if (declarationList.flags & ts.NodeFlags.Let) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "building-object-mutation",
						category: "imperative",
						message:
							"Prefer const over let; use immutable patterns or Ref for mutable state",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use const with immutable operations, or Effect Ref for state",
					});
				}
			}

			// Detect mutation operators (++, --, +=, -=, etc.)
			if (
				ts.isPrefixUnaryExpression(node) ||
				ts.isPostfixUnaryExpression(node)
			) {
				const operator = node.operator;
				if (
					operator === ts.SyntaxKind.PlusPlusToken ||
					operator === ts.SyntaxKind.MinusMinusToken
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "building-object-mutation",
						category: "imperative",
						message: "Mutation operators (++/--) violate immutability",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "error",
						certainty: "definite",
						suggestion: "Use immutable operations or Ref.update()",
					});
				}
			}

			// Detect compound assignment operators
			if (ts.isBinaryExpression(node)) {
				const operator = node.operatorToken.kind;
				const mutationOperators = [
					ts.SyntaxKind.PlusEqualsToken,
					ts.SyntaxKind.MinusEqualsToken,
					ts.SyntaxKind.AsteriskEqualsToken,
					ts.SyntaxKind.SlashEqualsToken,
					ts.SyntaxKind.PercentEqualsToken,
					ts.SyntaxKind.AmpersandEqualsToken,
					ts.SyntaxKind.BarEqualsToken,
					ts.SyntaxKind.CaretEqualsToken,
				];

				if (mutationOperators.includes(operator)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "building-object-mutation",
						category: "imperative",
						message: "Compound assignment operators violate immutability",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "error",
						certainty: "definite",
						suggestion: "Use immutable operations or Ref.update()",
					});
				}
			}

			// Detect Array.push, Array.pop, Array.splice, etc.
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const methodName = node.expression.name.text;
				const mutatingMethods = [
					"push",
					"pop",
					"shift",
					"unshift",
					"splice",
					"sort",
					"reverse",
					"fill",
					"copyWithin",
				];

				if (mutatingMethods.includes(methodName)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "array-splice-modification",
						category: "imperative",
						message: `Array.${methodName}() mutates the array; use Effect Array module`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "potential",
						suggestion: `Use Array.append, Array.prepend, Array.remove, or other immutable operations`,
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
