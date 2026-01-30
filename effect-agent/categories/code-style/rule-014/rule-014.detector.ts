/**
 * rule-014: validate-api-response
 *
 * Rule: Never use type casting (as); use Schema.decodeUnknown or type guards
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "code-style",
	name: "validate-api-response",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect 'as SomeType' on fetch/API response data
		if (ts.isAsExpression(node)) {
			// Check if this is casting response data
			let parent = node.parent;
			let isApiContext = false;

			while (parent) {
				const parentText = parent.getText(sourceFile).toLowerCase();
				if (
					parentText.includes("fetch") ||
					parentText.includes(".json()") ||
					parentText.includes("response") ||
					parentText.includes("axios") ||
					parentText.includes("api")
				) {
					isApiContext = true;
					break;
				}
				parent = parent.parent;
			}

			if (isApiContext) {
				const typeText = node.type.getText(sourceFile);
				// Skip if it's 'as unknown' or 'as any' (handled by other rules)
				if (typeText !== "unknown" && typeText !== "any") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Type casting API response as ${typeText}; use Schema.decodeUnknown`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Use Schema.decodeUnknown(ResponseSchema)(data) for runtime validation of API responses",
					});
				}
			}
		}

		// Detect response.json() without Schema validation
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "json"
		) {
			// Check if the result is being validated
			let parent = node.parent;
			let hasValidation = false;

			while (parent) {
				const parentText = parent.getText(sourceFile);
				if (
					parentText.includes("Schema.decode") ||
					parentText.includes("decodeUnknown") ||
					parentText.includes("Schema.parse")
				) {
					hasValidation = true;
					break;
				}
				parent = parent.parent;
			}

			if (!hasValidation) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						".json() response without Schema validation; validate external data",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 60),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Pipe .json() result through Schema.decodeUnknown(ResponseSchema) for type-safe validation",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
