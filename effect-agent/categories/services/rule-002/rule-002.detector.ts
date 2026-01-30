/**
 * rule-002: context-tag-filesystem
 *
 * Rule: Never use direct file I/O; use a Context.Tag service
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "services",
	name: "context-tag-filesystem",
};

const fsMethods: Record<string, string> = {
	readFile: "fs.readFile should be wrapped in a FileSystem service",
	writeFile: "fs.writeFile should be wrapped in a FileSystem service",
	readFileSync: "fs.readFileSync should be wrapped in a FileSystem service",
	writeFileSync: "fs.writeFileSync should be wrapped in a FileSystem service",
	existsSync: "fs.existsSync should be wrapped in a FileSystem service",
	mkdir: "fs.mkdir should be wrapped in a FileSystem service",
	unlink: "fs.unlink should be wrapped in a FileSystem service",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect fs.* calls
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj)) {
				const objName = obj.text;

				if (objName === "fs" || objName === "fsPromises") {
					const message = fsMethods[method];
					if (message) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "error",
							certainty: "definite",
							suggestion:
								"Use @effect/platform FileSystem or create a Context.Tag service",
						});
					}
				}
			}
		}

		// Detect imports from fs modules
		if (ts.isImportDeclaration(node)) {
			const moduleSpecifier = node.moduleSpecifier;
			if (ts.isStringLiteral(moduleSpecifier)) {
				const moduleName = moduleSpecifier.text;

				if (
					moduleName === "node:fs" ||
					moduleName === "fs" ||
					moduleName === "fs/promises"
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `${moduleName} should be wrapped in a FileSystem service`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Use @effect/platform FileSystem or create a Context.Tag service",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
