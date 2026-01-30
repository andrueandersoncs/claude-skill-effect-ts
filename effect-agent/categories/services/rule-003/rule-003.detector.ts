/**
 * rule-003: context-tag-repository
 *
 * Rule: Never access database directly; use a Context.Tag repository
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "services",
	name: "context-tag-repository",
};

const databaseMethods = [
	"query",
	"execute",
	"findOne",
	"findMany",
	"create",
	"update",
	"delete",
];

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect database/ORM method calls
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;

			if (databaseMethods.includes(method)) {
				const fullCallText = node.getText(sourceFile);

				// Check if it looks like a database call (heuristic)
				const objText = node.expression.expression
					.getText(sourceFile)
					.toLowerCase();
				const looksLikeDb =
					objText.includes("db") ||
					objText.includes("repo") ||
					objText.includes("prisma") ||
					objText.includes("knex") ||
					objText.includes("client") ||
					objText.includes("pool");

				if (looksLikeDb) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Database .${method}() should be in a Repository service`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: fullCallText.slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Create a Context.Tag Repository service with Live/Test layers",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
