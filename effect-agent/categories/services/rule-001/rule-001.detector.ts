/**
 * rule-001: context-tag-api
 *
 * Rule: Never call external APIs directly; use a Context.Tag service
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "services",
	name: "context-tag-api",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect direct fetch calls
		if (ts.isCallExpression(node)) {
			const callText = node.expression.getText(sourceFile);

			if (callText === "fetch" || callText.startsWith("fetch(")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "fetch() should be wrapped in an HttpClient service",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Create a Context.Tag HttpClient service with Live/Test layers",
				});
			}
		}

		// Detect imports from node:http/https
		if (ts.isImportDeclaration(node)) {
			const moduleSpecifier = node.moduleSpecifier;
			if (ts.isStringLiteral(moduleSpecifier)) {
				const moduleName = moduleSpecifier.text;

				if (moduleName === "node:http" || moduleName === "node:https") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `${moduleName} should be wrapped in an Http service`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use @effect/platform HttpClient or create a Context.Tag service",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
