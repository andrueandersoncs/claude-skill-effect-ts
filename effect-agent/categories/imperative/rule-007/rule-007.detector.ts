/**
 * rule-007: limited-concurrency
 *
 * Rule: Never use manual batching loops; use Effect.all with concurrency
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "imperative",
	name: "limited-concurrency",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Promise.all inside loops (manual batching for concurrency)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Promise" && method === "all") {
				// Check if this is inside a loop
				let parent = node.parent;
				while (parent) {
					if (
						ts.isForStatement(parent) ||
						ts.isForOfStatement(parent) ||
						ts.isForInStatement(parent) ||
						ts.isWhileStatement(parent) ||
						ts.isDoStatement(parent)
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Promise.all inside loop for concurrency; use Effect.all with concurrency option",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use Effect.all(effects, { concurrency: n }) or Effect.forEach with concurrency",
						});
						break;
					}
					parent = parent.parent;
				}
			}
		}

		// Detect manual semaphore/queue patterns
		if (ts.isVariableDeclaration(node) && node.name && node.initializer) {
			const nameText = node.name.getText(sourceFile).toLowerCase();
			if (
				nameText.includes("semaphore") ||
				nameText.includes("queue") ||
				nameText.includes("concurrency") ||
				nameText.includes("inprogress") ||
				nameText.includes("running")
			) {
				const initText = node.initializer.getText(sourceFile);
				if (
					initText === "0" ||
					initText === "[]" ||
					initText.includes("new Set") ||
					initText.includes("new Map")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Manual concurrency tracking; use Effect.all with concurrency option",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Effect.all(effects, { concurrency: n }) for built-in concurrency control",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
