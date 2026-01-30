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

	// Legitimate context keywords for Schema.Unknown/Any
	const legitimateKeywords = [
		"cause",
		"error",
		"external",
		"generic",
		"json",
		"rawdata",
		"unknowncause",
	];

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
				let isLegitimate = false;

				// Check if it's in a property assignment and the property name suggests legitimate use
				let parent = node.parent;
				while (parent && !isLegitimate) {
					// Check property assignment names
					if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
						const propAssignName = parent.name.text.toLowerCase();
						if (
							legitimateKeywords.some(
								(kw) =>
									propAssignName.includes(kw) ||
									propAssignName === "cause" ||
									propAssignName === "error",
							)
						) {
							isLegitimate = true;
						}
					}

					// Check variable declaration names
					if (
						ts.isVariableDeclaration(parent) &&
						ts.isIdentifier(parent.name)
					) {
						const varName = parent.name.text.toLowerCase();
						if (legitimateKeywords.some((kw) => varName.includes(kw))) {
							isLegitimate = true;
						}
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
