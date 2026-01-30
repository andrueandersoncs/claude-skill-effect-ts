/**
 * Native APIs detector
 *
 * Detects JavaScript native APIs that have Effect equivalents
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

interface ApiReplacement {
	ruleId: string;
	message: string;
	suggestion: string;
}

const nativeApiReplacements: Record<string, Record<string, ApiReplacement>> = {
	Object: {
		keys: {
			ruleId: "converting-to-entries",
			message: "Object.keys() should be replaced with Record.keys()",
			suggestion: "Use Record.keys() from effect",
		},
		values: {
			ruleId: "converting-to-entries",
			message: "Object.values() should be replaced with Record.values()",
			suggestion: "Use Record.values() from effect",
		},
		entries: {
			ruleId: "converting-to-entries",
			message: "Object.entries() should be replaced with Record.toEntries()",
			suggestion: "Use Record.toEntries() from effect",
		},
		fromEntries: {
			ruleId: "converting-to-entries",
			message:
				"Object.fromEntries() should be replaced with Record.fromEntries()",
			suggestion: "Use Record.fromEntries() from effect",
		},
		assign: {
			ruleId: "omitting-fields",
			message: "Object.assign() mutates objects; use spread or Struct module",
			suggestion: "Use spread syntax or Struct.evolve() for immutable updates",
		},
	},
	JSON: {
		parse: {
			ruleId: "parse-json",
			message: "JSON.parse() should be replaced with Schema.parseJson()",
			suggestion: "Use Schema.parseJson(MySchema) for type-safe parsing",
		},
		stringify: {
			ruleId: "parse-json",
			message: "JSON.stringify() should be replaced with Schema encoding",
			suggestion: "Use Schema.encode() for type-safe serialization",
		},
	},
	Math: {
		random: {
			ruleId: "function-constant-value",
			message:
				"Math.random() is impure; consider Effect.sync or Random service",
			suggestion:
				"Use Effect.sync(() => Math.random()) or inject a Random service",
		},
	},
	Date: {
		now: {
			ruleId: "function-constant-value",
			message: "Date.now() is impure; consider Effect.sync or Clock service",
			suggestion:
				"Use Effect.sync(() => Date.now()) or Clock.currentTimeMillis",
		},
	},
	console: {
		log: {
			ruleId: "function-constant-value",
			message: "console.log() should be replaced with Effect.log",
			suggestion: "Use Effect.log() for structured logging",
		},
		warn: {
			ruleId: "function-constant-value",
			message: "console.warn() should be replaced with Effect.logWarning",
			suggestion: "Use Effect.logWarning() for structured logging",
		},
		error: {
			ruleId: "function-constant-value",
			message: "console.error() should be replaced with Effect.logError",
			suggestion: "Use Effect.logError() for structured logging",
		},
		info: {
			ruleId: "function-constant-value",
			message: "console.info() should be replaced with Effect.logInfo",
			suggestion: "Use Effect.logInfo() for structured logging",
		},
		debug: {
			ruleId: "function-constant-value",
			message: "console.debug() should be replaced with Effect.logDebug",
			suggestion: "Use Effect.logDebug() for structured logging",
		},
	},
};

const arrayMethodReplacements: Record<string, ApiReplacement> = {
	find: {
		ruleId: "finding-with-default",
		message:
			"Array.find() returns undefined; use Array.findFirst() with Option",
		suggestion: "Use Array.findFirst() which returns Option<T>",
	},
	findIndex: {
		ruleId: "finding-with-default",
		message:
			"Array.findIndex() returns -1; use Array.findFirstIndex() with Option",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
	includes: {
		ruleId: "finding-with-default",
		message: "Consider Array.contains() or Array.containsWith() from Effect",
		suggestion: "Use Array.contains() from effect",
	},
	indexOf: {
		ruleId: "finding-with-default",
		message: "Array.indexOf() returns -1; use Array.findFirstIndex()",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
	flat: {
		ruleId: "flattening-nested-arrays",
		message: "Array.flat() should be replaced with Array.flatten()",
		suggestion: "Use Array.flatten() from effect",
	},
	flatMap: {
		ruleId: "flattening-nested-arrays",
		message: "Consider Array.flatMap() from Effect for consistency",
		suggestion: "Use Array.flatMap() from effect",
	},
	reduce: {
		ruleId: "conditional-accumulation",
		message: "Consider Array.reduce() from Effect for consistency",
		suggestion: "Use Array.reduce() from effect for better type inference",
	},
	reduceRight: {
		ruleId: "conditional-accumulation",
		message: "Consider Array.reduceRight() from Effect",
		suggestion: "Use Array.reduceRight() from effect",
	},
	filter: {
		ruleId: "filter-and-transform-single-pass",
		message:
			"Consider Array.filter() from Effect; combine with map using filterMap",
		suggestion:
			"Use Array.filter() from effect, or Array.filterMap() for combined operations",
	},
	map: {
		ruleId: "filter-and-transform-single-pass",
		message: "Consider Array.map() from Effect for consistency",
		suggestion: "Use Array.map() from effect",
	},
	sort: {
		ruleId: "array-splice-modification",
		message: "Array.sort() mutates in place; use Array.sort() from Effect",
		suggestion: "Use Array.sort() from effect which returns a new array",
	},
	reverse: {
		ruleId: "array-splice-modification",
		message:
			"Array.reverse() mutates in place; use Array.reverse() from Effect",
		suggestion: "Use Array.reverse() from effect which returns a new array",
	},
	slice: {
		ruleId: "head-and-tail-access",
		message:
			"Consider Array.take(), Array.drop(), or Array.splitAt() from Effect",
		suggestion: "Use Array.take(), Array.drop(), or Array.splitAt()",
	},
	concat: {
		ruleId: "flattening-nested-arrays",
		message: "Consider Array.append() or Array.appendAll() from Effect",
		suggestion: "Use Array.appendAll() from effect",
	},
	every: {
		ruleId: "struct-predicate",
		message: "Consider Array.every() from Effect for consistency",
		suggestion: "Use Array.every() from effect",
	},
	some: {
		ruleId: "struct-predicate",
		message: "Consider Array.some() from Effect for consistency",
		suggestion: "Use Array.some() from effect",
	},
};

export const nativeApisDetector: CategoryDetector = {
	category: "native-apis",
	description: "Detects native JS APIs that have Effect equivalents",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect static method calls like Object.keys(), JSON.parse()
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (ts.isIdentifier(obj)) {
					const objName = obj.text;
					const replacements = nativeApiReplacements[objName];

					if (replacements?.[method]) {
						const { ruleId, message, suggestion } = replacements[method];
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId,
							category: "native-apis",
							message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: objName === "console" ? "warning" : "error",
							certainty:
								objName === "console" ||
								objName === "Math" ||
								objName === "Date"
									? "potential"
									: "definite",
							suggestion,
						});
					}
				}

				// Detect array instance methods
				const replacement = arrayMethodReplacements[method];
				if (replacement) {
					// Check if it's likely called on an array (heuristic)
					const objText = obj.getText(sourceFile).toLowerCase();
					const isLikelyArray =
						objText.includes("arr") ||
						objText.includes("list") ||
						objText.includes("items") ||
						objText.includes("[]") ||
						objText.endsWith("s");

					if (
						isLikelyArray ||
						method === "find" ||
						method === "filter" ||
						method === "map"
					) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: replacement.ruleId,
							category: "native-apis",
							message: replacement.message,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "info",
							certainty: "potential",
							suggestion: replacement.suggestion,
						});
					}
				}
			}

			// Detect [...new Set()] pattern
			if (ts.isSpreadElement(node)) {
				const child = node.expression;
				if (
					ts.isNewExpression(child) &&
					ts.isIdentifier(child.expression) &&
					child.expression.text === "Set"
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "removing-duplicates",
						category: "native-apis",
						message: "[...new Set()] should be replaced with Array.dedupe()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.parent.getText(sourceFile).slice(0, 100),
						severity: "error",
						certainty: "definite",
						suggestion: "Use Array.dedupe() from effect",
					});
				}
			}

			// Detect new Set() generally
			if (
				ts.isNewExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "Set"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "removing-duplicates",
					category: "native-apis",
					message: "new Set() may be replaced with HashSet from Effect",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion: "Consider HashSet from effect for set operations",
				});
			}

			// Detect new Map()
			if (
				ts.isNewExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "Map"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "grouping-items-by-key",
					category: "native-apis",
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

			// Detect array[0] access (should use Array.head)
			if (
				ts.isElementAccessExpression(node) &&
				ts.isNumericLiteral(node.argumentExpression)
			) {
				const index = node.argumentExpression.text;
				if (index === "0") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "head-and-tail-access",
						category: "native-apis",
						message:
							"array[0] may return undefined; use Array.head() for Option<T>",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "warning",
						certainty: "potential",
						suggestion: "Use Array.head() which returns Option<T>",
					});
				} else if (index === "-1" || parseInt(index, 10) < 0) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "head-and-tail-access",
						category: "native-apis",
						message: "Negative array index; use Array.last() for Option<T>",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "warning",
						certainty: "potential",
						suggestion: "Use Array.last() which returns Option<T>",
					});
				}
			}

			// Detect .length === 0 or .length > 0 checks
			if (
				ts.isBinaryExpression(node) &&
				ts.isPropertyAccessExpression(node.left) &&
				node.left.name.text === "length"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: "head-and-tail-access",
					category: "native-apis",
					message:
						".length comparison should use Array.isEmptyArray() or Array.match()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Array.isEmptyArray() or Array.isNonEmptyArray() predicates",
				});
			}

			// Detect () => value (should use Function.constant)
			if (
				ts.isArrowFunction(node) &&
				node.parameters.length === 0 &&
				!ts.isBlock(node.body)
			) {
				// Check if body is a simple identifier or literal (not a call)
				const body = node.body;
				if (
					ts.isIdentifier(body) ||
					ts.isStringLiteral(body) ||
					ts.isNumericLiteral(body) ||
					body.kind === ts.SyntaxKind.TrueKeyword ||
					body.kind === ts.SyntaxKind.FalseKeyword ||
					body.kind === ts.SyntaxKind.NullKeyword
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "function-constant-value",
						category: "native-apis",
						message: "() => constant can be replaced with Function.constant()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "info",
						certainty: "potential",
						suggestion: "Use Function.constant(value) from effect",
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return violations;
	},
};
