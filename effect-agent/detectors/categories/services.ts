/**
 * Services detector
 *
 * Detects direct API calls and improper service patterns
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const servicesDetector: CategoryDetector = {
	category: "services",
	description: "Detects direct API calls that should use Context.Tag services",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		// Direct API calls that should be wrapped in services
		const directApiCalls = [
			{
				name: "fetch",
				ruleId: "context-tag-api",
				message: "fetch() should be wrapped in an HttpClient service",
				suggestion:
					"Create a Context.Tag HttpClient service with Live/Test layers",
			},
			{
				name: "axios",
				ruleId: "wrap-third-party-sdk",
				message: "axios should be wrapped in an HttpClient service",
				suggestion:
					"Create a Context.Tag service wrapping axios with Live/Test layers",
			},
		];

		// Node.js APIs that should be wrapped
		const nodeApis: Record<
			string,
			{ ruleId: string; message: string; suggestion: string }
		> = {
			readFile: {
				ruleId: "context-tag-filesystem",
				message: "fs.readFile should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			writeFile: {
				ruleId: "context-tag-filesystem",
				message: "fs.writeFile should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			readFileSync: {
				ruleId: "context-tag-filesystem",
				message: "fs.readFileSync should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			writeFileSync: {
				ruleId: "context-tag-filesystem",
				message: "fs.writeFileSync should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			existsSync: {
				ruleId: "context-tag-filesystem",
				message: "fs.existsSync should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			mkdir: {
				ruleId: "context-tag-filesystem",
				message: "fs.mkdir should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
			unlink: {
				ruleId: "context-tag-filesystem",
				message: "fs.unlink should be wrapped in a FileSystem service",
				suggestion:
					"Use @effect/platform FileSystem or create a Context.Tag service",
			},
		};

		// Database/storage patterns
		const databasePatterns = [
			{
				pattern: /\.query\(/,
				ruleId: "context-tag-repository",
				message: "Database .query() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.execute\(/,
				ruleId: "context-tag-repository",
				message: "Database .execute() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.findOne\(/,
				ruleId: "context-tag-repository",
				message: "ORM .findOne() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.findMany\(/,
				ruleId: "context-tag-repository",
				message: "ORM .findMany() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.create\(/,
				ruleId: "context-tag-repository",
				message: "ORM .create() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.update\(/,
				ruleId: "context-tag-repository",
				message: "ORM .update() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
			{
				pattern: /\.delete\(/,
				ruleId: "context-tag-repository",
				message: "ORM .delete() should be in a Repository service",
				suggestion:
					"Create a Context.Tag Repository service with Live/Test layers",
			},
		];

		const visit = (node: ts.Node) => {
			// Detect direct fetch/axios calls
			if (ts.isCallExpression(node)) {
				const callText = node.expression.getText(sourceFile);

				for (const api of directApiCalls) {
					if (callText === api.name || callText.startsWith(`${api.name}(`)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: api.ruleId,
							category: "services",
							message: api.message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "error",
							certainty: "definite",
							suggestion: api.suggestion,
						});
					}
				}
			}

			// Detect fs.* calls
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (ts.isIdentifier(obj)) {
					const objName = obj.text;

					// Check for fs.* calls
					if (objName === "fs" || objName === "fsPromises") {
						const apiInfo = nodeApis[method];
						if (apiInfo) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: apiInfo.ruleId,
								category: "services",
								message: apiInfo.message,
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "error",
								certainty: "definite",
								suggestion: apiInfo.suggestion,
							});
						}
					}

					// Check for process.env access (should be ConfigProvider)
					if (objName === "process" && method === "env") {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: "wrap-third-party-sdk",
							category: "services",
							message: "process.env should be accessed via Effect Config",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "warning",
							certainty: "potential",
							suggestion: "Use Config.string('VAR_NAME') with ConfigProvider",
						});
					}
				}

				// Check for database patterns
				const fullCallText = node.getText(sourceFile);
				for (const db of databasePatterns) {
					if (db.pattern.test(fullCallText)) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: db.ruleId,
							category: "services",
							message: db.message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: fullCallText.slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion: db.suggestion,
						});
					}
				}
			}

			// Detect process.env property access
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
						ruleId: "wrap-third-party-sdk",
						category: "services",
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

			// Detect imports from node:* or common packages that should be wrapped
			if (ts.isImportDeclaration(node)) {
				const moduleSpecifier = node.moduleSpecifier;
				if (ts.isStringLiteral(moduleSpecifier)) {
					const moduleName = moduleSpecifier.text;

					const wrapSuggestions: Record<
						string,
						{ ruleId: string; message: string; suggestion: string }
					> = {
						"node:fs": {
							ruleId: "context-tag-filesystem",
							message: "node:fs should be wrapped in a FileSystem service",
							suggestion:
								"Use @effect/platform FileSystem or create a Context.Tag service",
						},
						fs: {
							ruleId: "context-tag-filesystem",
							message: "fs module should be wrapped in a FileSystem service",
							suggestion:
								"Use @effect/platform FileSystem or create a Context.Tag service",
						},
						"fs/promises": {
							ruleId: "context-tag-filesystem",
							message: "fs/promises should be wrapped in a FileSystem service",
							suggestion:
								"Use @effect/platform FileSystem or create a Context.Tag service",
						},
						"node:http": {
							ruleId: "context-tag-api",
							message: "node:http should be wrapped in an Http service",
							suggestion:
								"Use @effect/platform HttpClient or create a Context.Tag service",
						},
						"node:https": {
							ruleId: "context-tag-api",
							message: "node:https should be wrapped in an Http service",
							suggestion:
								"Use @effect/platform HttpClient or create a Context.Tag service",
						},
					};

					const info = wrapSuggestions[moduleName];
					if (info) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: info.ruleId,
							category: "services",
							message: info.message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile),
							severity: "info",
							certainty: "potential",
							suggestion: info.suggestion,
						});
					}
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
