/**
 * rule-012: layer-test
 *
 * Rule: Never use live services in tests; use layer() from @effect/vitest
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "testing",
	name: "layer-test",
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
		// Detect Layer usage with .provide
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "provide"
		) {
			const args = node.arguments;
			if (args.length > 0) {
				const argText = args[0].getText(sourceFile);
				if (
					argText.includes("Layer.") ||
					argText.includes("Live") ||
					argText.includes("Test")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Layer provision in tests; consider it.layer for test suite setup",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use it.layer() or describe.layer() for suite-wide layer provision",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
