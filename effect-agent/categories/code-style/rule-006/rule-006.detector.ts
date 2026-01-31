/**
 * rule-006: effect-gen-multi-step
 *
 * Rule: Use Effect.gen() for multi-step sequential operations
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "code-style",
	name: "effect-gen-multi-step",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Count nested flatMap/andThen calls recursively
	const countNestedEffectMethods = (node: ts.Node): number => {
		let count = 0;

		const countInNode = (n: ts.Node) => {
			if (
				ts.isCallExpression(n) &&
				ts.isPropertyAccessExpression(n.expression)
			) {
				const method = n.expression.name.text;
				if (
					method === "flatMap" ||
					method === "andThen" ||
					method === "tap" ||
					method === "map"
				) {
					count++;
				}
			}
			ts.forEachChild(n, countInNode);
		};

		countInNode(node);
		return count;
	};

	// Track already reported nodes to avoid duplicates
	const reportedNodes = new Set<ts.Node>();

	const visit = (node: ts.Node) => {
		// Detect .pipe() calls that contain nested Effect methods
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "pipe" &&
			!reportedNodes.has(node)
		) {
			// Count all nested Effect methods inside this pipe
			const nestedCount = countNestedEffectMethods(node);

			if (nestedCount >= 3) {
				reportedNodes.add(node);
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Long Effect chain; consider Effect.gen() for readability",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Use Effect.gen(function* () { const a = yield* step1; const b = yield* step2; ... }) for multi-step operations",
				});
			}
		}

		// Also detect chained method calls without pipe
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			!reportedNodes.has(node)
		) {
			const method = node.expression.name.text;

			if (method === "flatMap" || method === "andThen" || method === "tap") {
				// Count chain depth going up the tree
				let chainDepth = 0;
				let current: ts.Node = node;

				while (
					ts.isCallExpression(current) &&
					ts.isPropertyAccessExpression(current.expression)
				) {
					const m = current.expression.name.text;
					if (
						m === "flatMap" ||
						m === "andThen" ||
						m === "tap" ||
						m === "map"
					) {
						chainDepth++;
					}
					current = current.expression.expression;
				}

				if (chainDepth >= 3) {
					reportedNodes.add(node);
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Long Effect chain; consider Effect.gen() for readability",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Effect.gen(function* () { const a = yield* step1; const b = yield* step2; ... }) for multi-step operations",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
