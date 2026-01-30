/**
 * rule-005: layer-effect
 *
 * Rule: Never create services inline; use Layer.effect or Layer.succeed
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "services",
	name: "layer-effect",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect inline service creation in Effect.gen
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Effect" && method === "gen") {
				if (node.arguments.length > 0) {
					const genBody = node.arguments[0].getText(sourceFile);

					// Check for inline object creation that looks like a service
					if (
						genBody.includes("return {") &&
						(genBody.includes(":") || genBody.includes("()"))
					) {
						// Check if it's creating an object with methods
						const methodPattern = /\w+:\s*\(.*\)\s*=>/;
						if (methodPattern.test(genBody)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Inline service creation; use Layer.effect or Layer.succeed",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 80),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Use Layer.effect(ServiceTag, Effect.gen(function* () { ... })) for services with dependencies",
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
