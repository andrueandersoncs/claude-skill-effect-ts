/**
 * rule-007: map-error
 *
 * Rule: Never rethrow transformed errors; use Effect.mapError
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "errors",
	name: "map-error",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect catch blocks that throw new errors
		if (ts.isCatchClause(node)) {
			const blockText = node.block.getText(sourceFile);

			if (
				blockText.includes("throw new") ||
				blockText.includes("throw Error")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Catch and rethrow transformed error; use Effect.mapError",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use effect.pipe(Effect.mapError(e => new DomainError(e))) instead of catch-and-rethrow",
				});
			}
		}

		// Detect Effect.catchAll that just wraps and fails
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;

			if (method === "catchAll" || method === "catchTag") {
				if (node.arguments.length > 0) {
					const handlerText =
						node.arguments[node.arguments.length - 1].getText(sourceFile);

					if (
						handlerText.includes("Effect.fail") &&
						!handlerText.includes("Effect.succeed")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"catchAll/catchTag that only fails; use mapError instead",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Use Effect.mapError(e => new TransformedError(e)) when just transforming error types",
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
