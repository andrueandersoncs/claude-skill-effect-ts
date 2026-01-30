/**
 * rule-010: it-scoped
 *
 * Rule: Never manage resources manually in tests; use it.scoped
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "testing",
	name: "it-scoped",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files (and .bad.ts for testing the detector)
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const visit = (node: ts.Node) => {
		// Detect it.effect with manual resource management
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "it" && method === "effect") {
				if (node.arguments.length >= 2) {
					const callback = node.arguments[1];
					if (
						ts.isArrowFunction(callback) ||
						ts.isFunctionExpression(callback)
					) {
						const bodyText = callback.getText(sourceFile);

						// Check for resource patterns that should use it.scoped
						const hasManualResource =
							bodyText.includes("acquireRelease") ||
							bodyText.includes("Effect.acquireUseRelease") ||
							bodyText.includes("Scope.make") ||
							(bodyText.includes("finally") &&
								(bodyText.includes("close") ||
									bodyText.includes("dispose") ||
									bodyText.includes("cleanup")));

						if (hasManualResource) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"it.effect with manual resource management; use it.scoped",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 80),
								severity: "warning",
								certainty: "potential",
								suggestion:
									"Use it.scoped() for tests with acquireRelease resources - it handles Scope automatically",
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
