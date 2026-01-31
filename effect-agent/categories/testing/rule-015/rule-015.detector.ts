/**
 * rule-015: test-clock
 *
 * Rule: Never provide TestClock.layer manually; it.effect includes it automatically
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-015",
	category: "testing",
	name: "test-clock",
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
		// Detect manual TestClock.layer provision patterns:
		// - .provide(TestClock.layer)
		// - Effect.provide(TestClock.layer)
		// - Layer.provide(TestClock.layer)
		// - Layer.merge(TestClock.layer)
		if (ts.isCallExpression(node)) {
			const expr = node.expression;

			// Check for .provide() or .merge() calls
			if (ts.isPropertyAccessExpression(expr)) {
				const methodName = expr.name.text;

				if (methodName === "provide" || methodName === "merge") {
					// Check if any argument is TestClock.layer
					for (const arg of node.arguments) {
						if (isTestClockLayer(arg)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Manual TestClock.layer provision detected; it.effect includes it automatically",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile),
								severity: "warning",
								certainty: "definite",
								suggestion:
									"Remove TestClock.layer provision; use it.effect which provides TestClock automatically",
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

/**
 * Check if a node represents TestClock layer provision
 * Handles: TestClock.defaultTestClock, TestClock.live(...), Effect.TestClock.defaultTestClock
 */
function isTestClockLayer(node: ts.Node): boolean {
	// TestClock.defaultTestClock
	if (
		ts.isPropertyAccessExpression(node) &&
		node.name.text === "defaultTestClock" &&
		ts.isIdentifier(node.expression) &&
		node.expression.text === "TestClock"
	) {
		return true;
	}

	// TestClock.live(...)
	if (
		ts.isCallExpression(node) &&
		ts.isPropertyAccessExpression(node.expression) &&
		node.expression.name.text === "live" &&
		ts.isIdentifier(node.expression.expression) &&
		node.expression.expression.text === "TestClock"
	) {
		return true;
	}

	// Effect.TestClock.defaultTestClock
	if (
		ts.isPropertyAccessExpression(node) &&
		node.name.text === "defaultTestClock" &&
		ts.isPropertyAccessExpression(node.expression) &&
		node.expression.name.text === "TestClock"
	) {
		return true;
	}

	return false;
}
