/**
 * rule-008: it-live
 *
 * Rule: Never use it.effect when you need real time; use it.live
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "testing",
	name: "it-live",
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
		// Detect it.effect that uses real time operations
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

						// Check for patterns that need real time
						const needsRealTime =
							bodyText.includes("Date.now") ||
							bodyText.includes("new Date") ||
							bodyText.includes("performance.now") ||
							bodyText.includes("setTimeout") ||
							bodyText.includes("setInterval") ||
							(bodyText.includes("Effect.sleep") &&
								!bodyText.includes("TestClock"));

						if (needsRealTime) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"it.effect with real time operations; consider it.live for real clock",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								certainty: "potential",
								suggestion:
									"Use it.live() when testing with real time/clock instead of it.effect() which uses TestClock",
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
