/**
 * rule-002: arbitrary-test-layer
 *
 * Rule: Never hard-code values in test layers; use Arbitrary-generated values
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "testing",
	name: "arbitrary-test-layer",
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
		// Detect manual test data arrays
		if (ts.isArrayLiteralExpression(node)) {
			const parent = node.parent;
			if (
				parent &&
				ts.isVariableDeclaration(parent) &&
				ts.isIdentifier(parent.name)
			) {
				const varName = parent.name.text.toLowerCase();
				if (
					varName.includes("test") ||
					varName.includes("mock") ||
					varName.includes("fixture") ||
					varName.includes("sample") ||
					varName.includes("data")
				) {
					const elements = node.elements;
					if (elements.length > 2) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Manual test data arrays should use Arbitrary.make(Schema)",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Use Arbitrary.make(YourSchema) to generate test data from schemas",
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
