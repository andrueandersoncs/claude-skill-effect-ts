/**
 * rule-015: test-clock
 *
 * Rule: Never provide TestClock.layer manually; it.effect includes it automatically
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

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
		// Detect TestClock usage - either as Effect.TestClock or TestClock.method()
		if (
			(ts.isPropertyAccessExpression(node) &&
				node.name.text === "TestClock") ||
			(ts.isPropertyAccessExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "TestClock")
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "TestClock detected; ensure test uses it.effect (not it.live)",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile),
				severity: "info",
				certainty: "potential",
				suggestion:
					"it.effect provides TestClock automatically; use it.live for real time",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
