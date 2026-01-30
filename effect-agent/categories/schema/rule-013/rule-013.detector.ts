/**
 * rule-013: tagged-union-state
 *
 * Rule: Never use optional properties for state; use tagged unions
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-013",
	category: "schema",
	name: "tagged-union-state",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect plain object literals with _tag property (should be Schema.TaggedClass)
		if (ts.isObjectLiteralExpression(node)) {
			const hasTag = node.properties.some(
				(prop) =>
					ts.isPropertyAssignment(prop) &&
					ts.isIdentifier(prop.name) &&
					prop.name.text === "_tag",
			);

			if (hasTag) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Objects with _tag should be Schema.TaggedClass instances",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion: "Define a Schema.TaggedClass and use its constructor",
				});
			}
		}

		// Detect Schema.Struct with multiple optional fields suggesting state
		if (ts.isCallExpression(node)) {
			const callText = node.expression.getText(sourceFile);
			if (callText === "Schema.Struct" && node.arguments.length > 0) {
				const arg = node.arguments[0];
				if (ts.isObjectLiteralExpression(arg)) {
					// Count optional fields that look like state-related fields
					const stateOptionalFields: string[] = [];
					const stateKeywords = [
						"at",
						"date",
						"time",
						"status",
						"state",
						"tracking",
						"shipped",
						"delivered",
						"completed",
						"cancelled",
						"confirmed",
						"pending",
						"processed",
					];

					for (const prop of arg.properties) {
						if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
							const propText = prop.initializer.getText(sourceFile);
							const propName = prop.name.text.toLowerCase();

							// Check if this is an optional field with state-like naming
							if (propText.includes("Schema.optional")) {
								const isStateLike = stateKeywords.some(
									(kw) =>
										propName.includes(kw) ||
										propName.endsWith("at") ||
										propName.endsWith("date"),
								);
								if (isStateLike) {
									stateOptionalFields.push(prop.name.text);
								}
							}
						}
					}

					// If we have 2+ state-related optional fields, suggest tagged union
					if (stateOptionalFields.length >= 2) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message: `Schema.Struct with multiple state-related optional fields (${stateOptionalFields.join(", ")}); consider using tagged union`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use Schema.Union with tagged variants like PendingOrder, ShippedOrder, DeliveredOrder for type-safe state transitions",
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
