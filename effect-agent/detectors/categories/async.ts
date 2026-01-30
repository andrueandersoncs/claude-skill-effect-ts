/**
 * Async code detector
 *
 * Detects async/await, Promise usage, setTimeout/setInterval, and callbacks
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const asyncDetector: CategoryDetector = {
	category: "async",
	description: "Detects async/await, Promises, and callback patterns",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

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
					ruleId: "promise-chain",
					category: "async",
					message: "Async functions should be converted to Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Convert to Effect.gen() or wrap with Effect.tryPromise()",
				});
			}

			// Detect await expressions
			if (ts.isAwaitExpression(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "promise-chain",
					category: "async",
					message:
						"Await expressions should be replaced with Effect.flatMap or yield*",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Use yield* in Effect.gen() or pipe with Effect.flatMap()",
				});
			}

			// Detect new Promise()
			if (
				ts.isNewExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "Promise"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "callback-api",
					category: "async",
					message: "new Promise() should be replaced with Effect.async()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Effect.async() for callback-based APIs",
				});
			}

			// Detect Promise.all, Promise.race, Promise.allSettled, Promise.any
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

					const suggestions: Record<
						string,
						{ rule: string; replacement: string }
					> = {
						all: { rule: "parallel-results", replacement: "Effect.all()" },
						allSettled: {
							rule: "parallel-results",
							replacement: "Effect.all({ mode: 'either' })",
						},
						race: { rule: "race-operations", replacement: "Effect.race()" },
						any: { rule: "race-operations", replacement: "Effect.raceAll()" },
						resolve: { rule: "promise-chain", replacement: "Effect.succeed()" },
						reject: { rule: "promise-chain", replacement: "Effect.fail()" },
					};

					const info = suggestions[method];
					if (info) {
						violations.push({
							ruleId: info.rule,
							category: "async",
							message: `Promise.${method}() should be replaced with ${info.replacement}`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "error",
							certainty: "definite",
							suggestion: `Use ${info.replacement}`,
						});
					}
				}
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
					ruleId: "promise-chain",
					category: "async",
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
				// Check if it's likely a Promise.catch (not Effect.catch*)
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "promise-chain",
					category: "async",
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

			// Detect setTimeout
			if (
				ts.isCallExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "setTimeout"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "repeated-execution",
					category: "async",
					message:
						"setTimeout should be replaced with Effect.sleep or Effect.delay",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Effect.sleep() or Effect.delay()",
				});
			}

			// Detect setInterval
			if (
				ts.isCallExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "setInterval"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "repeated-execution",
					category: "async",
					message:
						"setInterval should be replaced with Effect.repeat + Schedule",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Effect.repeat() with Schedule.spaced()",
				});
			}

			// Detect generator functions with yield (not yield*)
			if (
				(ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
				node.asteriskToken
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "generator-yield",
					category: "async",
					message: "Generator functions should not be mixed with Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Effect.gen() with yield* instead of plain generators",
				});
			}

			// Detect callback patterns (functions with callback parameter names)
			if (
				(ts.isFunctionDeclaration(node) ||
					ts.isFunctionExpression(node) ||
					ts.isArrowFunction(node)) &&
				node.parameters.length > 0
			) {
				const lastParam = node.parameters[node.parameters.length - 1];
				const paramName = lastParam.name.getText(sourceFile).toLowerCase();
				const callbackNames = [
					"callback",
					"cb",
					"done",
					"next",
					"resolve",
					"reject",
					"handler",
				];

				if (callbackNames.some((name) => paramName.includes(name))) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "callback-api",
						category: "async",
						message:
							"Callback-style APIs should be wrapped with Effect.async()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "info",
						certainty: "potential",
						suggestion: "Wrap callback-based APIs with Effect.async()",
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
