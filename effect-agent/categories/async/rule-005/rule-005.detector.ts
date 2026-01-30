/**
 * rule-005: promise-chain
 *
 * Rule: Never use Promise chains (.then); use pipe with Effect.map/flatMap
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "async",
	name: "promise-chain",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect async functions
		if (
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isArrowFunction(node) ||
				ts.isMethodDeclaration(node)) &&
			node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Async functions should be converted to Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion: "Convert to Effect.gen() or wrap with Effect.tryPromise()",
			});
		}

		// Detect await expressions
		if (ts.isAwaitExpression(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Await expressions should be replaced with Effect.flatMap or yield*",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion: "Use yield* in Effect.gen() or pipe with Effect.flatMap()",
			});
		}

		// Detect .then() chains
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "then"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: ".then() chains should be replaced with Effect.map/flatMap",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion: "Use pipe() with Effect.map() or Effect.flatMap()",
			});
		}

		// Detect .catch() chains
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "catch"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: ".catch() may be a Promise pattern; use Effect.catchAll",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "warning",
				certainty: "potential",
				suggestion:
					"If this is Promise.catch(), use Effect.catchAll() or Effect.catchTag()",
			});
		}

		// Detect Promise.resolve/reject
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;
			if (ts.isIdentifier(obj) && obj.text === "Promise") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				if (method === "resolve") {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Promise.resolve() should be replaced with Effect.succeed()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Effect.succeed()",
					});
				} else if (method === "reject") {
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Promise.reject() should be replaced with Effect.fail()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Effect.fail()",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
