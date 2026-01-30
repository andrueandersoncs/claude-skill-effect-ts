/**
 * rule-007: stateful-test-layer
 *
 * Rule: Never use stateless test mocks; use Layer.effect with Ref for state
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "services",
	name: "stateful-test-layer",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files or files with Test layers
	const fullText = sourceFile.getFullText();
	if (!fullText.includes("Test") && !filePath.includes("test")) {
		return violations;
	}

	const visit = (node: ts.Node) => {
		// Detect Layer.succeed for test layers (stateless)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (
				ts.isIdentifier(obj) &&
				obj.text === "Layer" &&
				method === "succeed"
			) {
				// Check if this is a test layer
				let parent = node.parent;
				while (parent) {
					const parentText = parent.getText(sourceFile);
					if (parentText.includes("Test")) {
						// Check if the service implementation uses Ref
						const argText =
							node.arguments.length > 1
								? node.arguments[1].getText(sourceFile)
								: "";

						if (!argText.includes("Ref") && !argText.includes("ref")) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Test layer with Layer.succeed (stateless); consider Layer.effect with Ref",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 80),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Use Layer.effect(Tag, Effect.gen(function* () { const state = yield* Ref.make(...); return { ... } })) for stateful test mocks",
							});
						}
						break;
					}
					parent = parent.parent;
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
