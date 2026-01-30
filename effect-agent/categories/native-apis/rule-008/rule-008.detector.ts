/**
 * rule-008: grouping-items-by-key
 *
 * Rule: Never manually group with loops; use Array.groupBy
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "native-apis",
	name: "grouping-items-by-key",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track variables initialized as empty objects that might be used for grouping
	const emptyObjectVars = new Set<string>();

	const visit = (node: ts.Node) => {
		// Detect variable initialized as empty object: const obj = {} or const obj: Record<...> = {}
		if (ts.isVariableDeclaration(node) && node.initializer) {
			if (
				ts.isObjectLiteralExpression(node.initializer) &&
				node.initializer.properties.length === 0
			) {
				if (ts.isIdentifier(node.name)) {
					emptyObjectVars.add(node.name.text);
				}
			}
		}

		// Detect for...of loop with grouping pattern
		if (ts.isForOfStatement(node)) {
			const body = node.statement;
			const bodyText = body.getText(sourceFile);

			// Check if body contains pattern: obj[key] = [] or obj[key].push(...)
			// which indicates manual grouping
			for (const varName of emptyObjectVars) {
				// Look for patterns like: varName[...] = [] and varName[...].push(...)
				const assignArrayPattern = new RegExp(
					`${varName}\\s*\\[.*?\\]\\s*=\\s*\\[\\s*\\]`,
				);
				const pushPattern = new RegExp(`${varName}\\s*\\[.*?\\]\\.push\\(`);

				if (assignArrayPattern.test(bodyText) && pushPattern.test(bodyText)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: "Manual grouping with for loop; use Array.groupBy",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use Array.groupBy(array, item => item.key) for cleaner grouping",
					});
					break;
				}
			}
		}

		// Also detect new Map() as a secondary pattern
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Map"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "new Map() may be replaced with HashMap from Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "Consider HashMap from effect for map operations",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
