/**
 * rule-001: context-tag-dependencies
 *
 * Rule: Never call external dependencies directly; always wrap them in a Context.Tag service
 *
 * Detects:
 * - HTTP API calls (fetch, axios, node:http/https)
 * - Filesystem operations (fs.readFile, fs.writeFile, etc.)
 * - Database/repository calls (db.query, prisma, etc.)
 * - Third-party SDK usage (process.env)
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "services",
	name: "context-tag-dependencies",
};

// Filesystem methods that should be wrapped
const fsMethods: Record<string, string> = {
	readFile: "fs.readFile should be wrapped in a FileSystem service",
	writeFile: "fs.writeFile should be wrapped in a FileSystem service",
	readFileSync: "fs.readFileSync should be wrapped in a FileSystem service",
	writeFileSync: "fs.writeFileSync should be wrapped in a FileSystem service",
	existsSync: "fs.existsSync should be wrapped in a FileSystem service",
	mkdir: "fs.mkdir should be wrapped in a FileSystem service",
	unlink: "fs.unlink should be wrapped in a FileSystem service",
};

// Database methods that indicate direct access
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
		// ========================================
		// 1. HTTP API Detection
		// ========================================

		// Detect direct fetch calls
		if (ts.isCallExpression(node)) {
			const callText = node.expression.getText(sourceFile);

			// fetch() calls
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

			// axios calls
			if (callText === "axios" || callText.startsWith("axios.")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "axios should be wrapped in an HttpClient service",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Create a Context.Tag service wrapping axios with Live/Test layers",
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

				// ========================================
				// 2. Filesystem Detection - imports
				// ========================================
				if (
					moduleName === "node:fs" ||
					moduleName === "fs" ||
					moduleName === "fs/promises" ||
					moduleName === "node:fs/promises"
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

		// ========================================
		// 2. Filesystem Detection - method calls
		// ========================================
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj)) {
				const objName = obj.text;

				// fs.* calls
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

			// ========================================
			// 3. Database/Repository Detection
			// ========================================
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

		// ========================================
		// 4. Third-Party SDK Detection (process.env)
		// ========================================

		// Detect process.env access with dot notation: process.env.X
		if (
			ts.isPropertyAccessExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const objExpr = node.expression;
			if (
				ts.isIdentifier(objExpr.expression) &&
				objExpr.expression.text === "process" &&
				objExpr.name.text === "env"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `process.env.${node.name.text} should use Effect Config`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: `Use Config.string('${node.name.text}') with ConfigProvider`,
				});
			}
		}

		// Detect process.env access with bracket notation: process.env["X"]
		if (
			ts.isElementAccessExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const objExpr = node.expression;
			if (
				ts.isIdentifier(objExpr.expression) &&
				objExpr.expression.text === "process" &&
				objExpr.name.text === "env"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				const keyText = node.argumentExpression.getText(sourceFile);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `process.env[${keyText}] should use Effect Config`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: `Use Config.string(${keyText}) with ConfigProvider`,
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
