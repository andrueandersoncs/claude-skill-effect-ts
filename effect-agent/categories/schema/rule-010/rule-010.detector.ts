/**
 * rule-010: schema-transform
 *
 * Rule: Never use manual type conversions; use Schema.transform
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "schema",
	name: "schema-transform",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect manual conversion functions
		if (
			(ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) &&
			node.parent
		) {
			const nodeText = node.getText(sourceFile).toLowerCase();
			const parentText = node.parent.getText(sourceFile).toLowerCase();

			// Check for conversion function names
			const conversionPatterns = [
				/toCents|fromCents|toDollars|fromDollars/i,
				/toNumber|fromNumber|toString|fromString/i,
				/toDate|fromDate|toTimestamp|fromTimestamp/i,
				/serialize|deserialize/i,
				/encode|decode/i,
				/parse[A-Z]/i,
				/format[A-Z]/i,
			];

			for (const pattern of conversionPatterns) {
				if (
					pattern.test(parentText) &&
					!nodeText.includes("schema.transform")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Manual conversion function; consider Schema.transform",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Schema.transform(FromSchema, ToSchema, { decode: ..., encode: ... }) for bidirectional conversions",
					});
					break;
				}
			}
		}

		// Detect division/multiplication for unit conversions
		if (
			ts.isBinaryExpression(node) &&
			(node.operatorToken.kind === ts.SyntaxKind.SlashToken ||
				node.operatorToken.kind === ts.SyntaxKind.AsteriskToken)
		) {
			const text = node.getText(sourceFile).toLowerCase();
			if (
				text.includes("100") ||
				text.includes("1000") ||
				text.includes("cents") ||
				text.includes("dollars")
			) {
				// Check if this is inside a Schema transform (which is fine)
				let parent = node.parent;
				let inSchemaTransform = false;
				while (parent) {
					if (parent.getText(sourceFile).includes("Schema.transform")) {
						inSchemaTransform = true;
						break;
					}
					parent = parent.parent;
				}

				if (!inSchemaTransform) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Manual unit conversion; consider Schema.transform",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 60),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Encapsulate unit conversions in Schema.transform for type-safe bidirectional conversion",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
