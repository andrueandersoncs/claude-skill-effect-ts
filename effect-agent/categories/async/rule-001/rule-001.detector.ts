/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import * as ts from "typescript";
import { Array as EffectArray, Match, Option, Function as Fn } from "effect";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "async",
	name: "callback-api",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const collectViolations = (node: ts.Node): Violation[] => {
		const nodeViolations: Violation[] = [];

		// Detect new Promise()
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Promise"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			nodeViolations.push({
				ruleId: meta.id,
				category: meta.category,
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

		// Detect callback patterns (functions with callback parameter names)
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isArrowFunction(node)
		) {
			const violation = EffectArray.match(node.parameters, {
				onEmpty: () => Option.none(),
				onNonEmpty: (params) => {
					const lastParam = params.at(-1);
					if (!lastParam) return Option.none();
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

					return Match.value(callbackNames).pipe(
						Match.when(
							(names) => names.some((name) => paramName.includes(name)),
							() => {
								const { line, character } = sourceFile.getLineAndCharacterOfPosition(
									node.getStart(),
								);
								return Option.some({
									ruleId: meta.id,
									category: meta.category,
									message: "Callback-style APIs should be wrapped with Effect.async()",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node.getText(sourceFile).slice(0, 100),
									severity: "info" as const,
									certainty: "potential" as const,
									suggestion: "Wrap callback-based APIs with Effect.async()",
								});
							},
						),
						Match.orElse(() => Option.none()),
					);
				},
			});

			Option.match(violation, {
				onSome: (v) => {
					nodeViolations.push(v);
				},
				onNone: Fn.constVoid,
			});
		}

		// Recursively collect violations from child nodes
		const childViolations: Violation[] = [];
		ts.forEachChild(node, (child) => {
			childViolations.push(...collectViolations(child));
		});

		return [...nodeViolations, ...childViolations];
	};

	return collectViolations(sourceFile);
};
