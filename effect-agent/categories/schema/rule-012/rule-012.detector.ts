/**
 * rule-012: schema-unknown-legitimate
 *
 * Rule: Never use Schema.Any/Schema.Unknown unless genuinely unconstrained
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "schema",
	name: "schema-unknown-legitimate",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Schema.Any or Schema.Unknown usage
		if (
			ts.isPropertyAccessExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Schema"
		) {
			const propName = node.name.text;

			if (propName === "Any" || propName === "Unknown") {
				// Check context - some uses are legitimate
				let parent = node.parent;
				let isLegitimate = false;

				// Check if it's used for error cause, external data, etc.
				while (parent && !isLegitimate) {
					const parentText = parent.getText(sourceFile).toLowerCase();
					if (
						parentText.includes("cause") ||
						parentText.includes("error") ||
						parentText.includes("external") ||
						parentText.includes("any") ||
						parentText.includes("unknown") ||
						parentText.includes("generic") ||
						parentText.includes("json")
					) {
						isLegitimate = true;
					}
					parent = parent.parent;
				}

				if (!isLegitimate) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Schema.${propName} used; ensure this is genuinely unconstrained data`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.parent?.getText(sourceFile).slice(0, 80) || "",
						severity: "info",
						certainty: "potential",
						suggestion:
							"Schema.Unknown is appropriate for error causes and truly dynamic data; otherwise define a proper schema",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
