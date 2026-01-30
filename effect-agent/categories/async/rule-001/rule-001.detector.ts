/**
 * rule-001: callback-api
 *
 * Rule: Never use new Promise(); use Effect.async for callback-based APIs
 */

import * as ts from "typescript";
import { Match, Option, Function as Fn, Array as EffectArray } from "effect";
import type { Violation } from "../../../detectors/types";

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
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isArrowFunction(node)) &&
			node.parameters.length > 0
		) {
			const lastParam = node.parameters.at(-1);
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

			const violation = Match.value(callbackNames).pipe(
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

			Option.match(violation, {
				onSome: (v) => {
					nodeViolations.push(v);
				},
				onNone: Fn.constVoid,
			});
		}

		// Recursively collect violations from child nodes
		let childViolations: Violation[] = [];
		ts.forEachChild(node, (child) => {
			const violations = collectViolations(child);
			childViolations = EffectArray.concat(childViolations, violations);
		});

		return EffectArray.concat(nodeViolations, childViolations);
	};

	return collectViolations(sourceFile);
};
