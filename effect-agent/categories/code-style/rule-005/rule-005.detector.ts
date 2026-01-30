/**
 * rule-005: effect-fn-transformation
 *
 * Rule: Never write plain functions; use Effect.fn() or Effect.gen()
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "code-style",
	name: "effect-fn-transformation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect plain function declarations that could be Effect.fn
		if (ts.isFunctionDeclaration(node) && node.name && node.body) {
			const bodyText = node.body.getText(sourceFile);

			// Check if it's a pure transformation (no side effects indicators)
			const hasReturn = bodyText.includes("return");
			const hasSideEffects =
				bodyText.includes("console.") ||
				bodyText.includes("throw") ||
				bodyText.includes("await") ||
				bodyText.includes("fetch") ||
				bodyText.includes(".mutate") ||
				bodyText.includes(".push") ||
				bodyText.includes(".pop");

			// Check if it's in an Effect-using file
			const fullText = sourceFile.getFullText();
			const usesEffect =
				fullText.includes('from "effect"') ||
				fullText.includes("from 'effect'");

			if (hasReturn && !hasSideEffects && usesEffect) {
				// This could potentially be an Effect.fn
				const funcName = node.name.text;

				// Skip if it's already creating an Effect
				if (!bodyText.includes("Effect.") && !bodyText.includes("yield*")) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Plain function '${funcName}'; consider Effect.fn() for traceability`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: `function ${funcName}(...)`,
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Effect.fn('functionName')((...args) => result) for traced pure transformations",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
