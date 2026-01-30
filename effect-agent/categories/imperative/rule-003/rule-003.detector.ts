/**
 * rule-003: chunked-processing
 *
 * Rule: Never use manual batching for large sequences; use Stream
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "imperative",
	name: "chunked-processing",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect manual chunking patterns like array.slice(i, i + batchSize)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const methodName = node.expression.name.text;

			// Check for slice with arithmetic (common batch pattern)
			if (methodName === "slice" && node.arguments.length >= 2) {
				const secondArg = node.arguments[1];
				if (
					ts.isBinaryExpression(secondArg) &&
					secondArg.operatorToken.kind === ts.SyntaxKind.PlusToken
				) {
					const argText = secondArg.getText(sourceFile).toLowerCase();
					if (
						argText.includes("batch") ||
						argText.includes("chunk") ||
						argText.includes("size")
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message:
								"Manual batching with slice; consider using Stream.grouped or Stream.chunks",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use Stream.fromIterable(data).pipe(Stream.grouped(batchSize)) for chunked processing",
						});
					}
				}
			}
		}

		// Detect while loops with batch-related variable names
		if (ts.isWhileStatement(node)) {
			const conditionText = node.expression.getText(sourceFile).toLowerCase();
			if (
				conditionText.includes("batch") ||
				conditionText.includes("chunk") ||
				conditionText.includes("offset")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "While loop for batching; use Stream for chunked processing",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Stream.fromIterable(data).pipe(Stream.grouped(n), Stream.mapEffect(processBatch))",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
