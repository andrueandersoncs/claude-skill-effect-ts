/**
 * rule-001: all-either-mode
 *
 * Rule: Never use fail-fast Promise.all; use Effect.all with mode: "either"
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "errors",
	name: "all-either-mode",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Promise.all usage
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Promise" && method === "all") {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Promise.all fails fast on first error; use Effect.all with mode option",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Effect.all(effects, { mode: 'either' }) to get Either results for each operation",
				});
			}

			// Also detect Effect.all without mode option when there are multiple effects
			if (ts.isIdentifier(obj) && obj.text === "Effect" && method === "all") {
				// Check if mode option is provided
				if (node.arguments.length >= 1) {
					const hasOptions = node.arguments.length >= 2;
					let hasModeOption = false;

					if (hasOptions) {
						const options = node.arguments[1];
						if (ts.isObjectLiteralExpression(options)) {
							hasModeOption = options.properties.some(
								(p) =>
									ts.isPropertyAssignment(p) &&
									p.name.getText(sourceFile) === "mode",
							);
						}
					}

					if (!hasModeOption) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Effect.all without mode option; consider { mode: 'either' } for individual results",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Add { mode: 'either' } to get Either<A, E> for each effect, or { mode: 'validate' } to collect all errors",
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
