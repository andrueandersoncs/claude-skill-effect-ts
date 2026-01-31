/**
 * rule-007: function-constant-value
 *
 * Rule: Never use () => value; use Function.constant
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "native-apis",
	name: "function-constant-value",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect () => value (should use Function.constant)
		if (
			ts.isArrowFunction(node) &&
			node.parameters.length === 0 &&
			!ts.isBlock(node.body)
		) {
			// Check if body is a simple identifier or literal (not a call)
			const body = node.body;
			if (
				ts.isIdentifier(body) ||
				ts.isStringLiteral(body) ||
				ts.isNumericLiteral(body) ||
				body.kind === ts.SyntaxKind.TrueKeyword ||
				body.kind === ts.SyntaxKind.FalseKeyword ||
				body.kind === ts.SyntaxKind.NullKeyword
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "() => constant can be replaced with Function.constant()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "info",
					certainty: "potential",
					suggestion: "Use Function.constant(value) from effect",
				});
			}
		}

		// Detect console.log/warn/error/info/debug (impure functions)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "console") {
				const consoleReplacements: Record<string, string> = {
					log: "Effect.log",
					warn: "Effect.logWarning",
					error: "Effect.logError",
					info: "Effect.logInfo",
					debug: "Effect.logDebug",
				};

				const replacement = consoleReplacements[method];
				if (replacement) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `console.${method}() should be replaced with ${replacement}`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "warning",
						certainty: "potential",
						suggestion: `Use ${replacement}() for structured logging`,
					});
				}
			}

			// Detect Math.random() and Date.now()
			if (ts.isIdentifier(obj)) {
				if (obj.text === "Math" && method === "random") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Math.random() is impure; consider Effect.sync or Random service",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Effect.sync(() => Math.random()) or inject a Random service",
					});
				}

				if (obj.text === "Date" && method === "now") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Date.now() is impure; consider Effect.sync or Clock service",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Effect.sync(() => Date.now()) or Clock.currentTimeMillis",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
