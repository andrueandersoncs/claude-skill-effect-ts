/**
 * rule-006: it-effect-prop
 *
 * Rule: Never use hard-coded test data; use it.effect.prop with Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "testing",
	name: "it-effect-prop",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__")
	) {
		return violations;
	}

	const visit = (node: ts.Node) => {
		// Detect it.effect with hardcoded test data
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "it" && method === "effect") {
				// Check callback body for hardcoded data patterns
				if (node.arguments.length >= 2) {
					const callback = node.arguments[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);

						// Look for hardcoded arrays/objects with multiple items
						const hasHardcodedArray = /\[\s*["'`\d].*,.*,.*\]/.test(bodyText);
						const hasHardcodedObject = /\{\s*\w+:\s*["'`\d].*,.*\}/.test(
							bodyText,
						);

						if (hasHardcodedArray || hasHardcodedObject) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"it.effect with hardcoded test data; consider it.effect.prop for property-based testing",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 80),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Use it.effect.prop({ data: Schema }, ({ data }) => Effect.gen(...)) for generated test data",
							});
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
