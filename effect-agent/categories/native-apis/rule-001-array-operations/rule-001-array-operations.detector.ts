/**
 * rule-001-array-operations: Consolidated Array Operations
 *
 * This detector consolidates detection for all Effect Array module replacements:
 * - filter().map() chains -> Array.filterMap
 * - find/findIndex/includes/indexOf -> Array.findFirst, Array.contains
 * - manual grouping loops -> Array.groupBy
 * - arr[0], arr[length-1] -> Array.head, Array.last
 * - [...new Set()] -> Array.dedupe
 * - push/pop/splice/etc -> Array.append, Array.remove, etc.
 * - filter twice with opposite conditions -> Array.partition
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001-array-operations",
	category: "native-apis",
	name: "array-operations-consolidated",
};

// Methods that return undefined/null/-1 and should use Effect alternatives
const findMethods: Record<string, { message: string; suggestion: string }> = {
	find: {
		message:
			"Array.find() returns undefined; use Array.findFirst() with Option",
		suggestion: "Use Array.findFirst() which returns Option<T>",
	},
	findIndex: {
		message:
			"Array.findIndex() returns -1; use Array.findFirstIndex() with Option",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
	includes: {
		message: "Consider Array.contains() or Array.containsWith() from Effect",
		suggestion: "Use Array.contains() from effect",
	},
	indexOf: {
		message: "Array.indexOf() returns -1; use Array.findFirstIndex()",
		suggestion: "Use Array.findFirstIndex() which returns Option<number>",
	},
};

// Mutating methods that should use immutable Effect alternatives
const mutatingMethods: Record<string, { message: string; suggestion: string }> =
	{
		push: {
			message: "Array.push() mutates the array; use Array.append()",
			suggestion: "Use Array.append() for immutable append",
		},
		pop: {
			message: "Array.pop() mutates the array; use Array.initNonEmpty()",
			suggestion: "Use Array.initNonEmpty() to get all but last element",
		},
		shift: {
			message: "Array.shift() mutates the array; use Array.tailNonEmpty()",
			suggestion: "Use Array.tailNonEmpty() to get all but first element",
		},
		unshift: {
			message: "Array.unshift() mutates the array; use Array.prepend()",
			suggestion: "Use Array.prepend() for immutable prepend",
		},
		splice: {
			message:
				"Array.splice() mutates the array; use Array.remove() or Array.insertAt()",
			suggestion:
				"Use Array.remove() to delete or Array.insertAt() to insert immutably",
		},
		sort: {
			message: "Array.sort() mutates the array; use Array.sort() from Effect",
			suggestion: "Use Array.sort() from effect which is immutable",
		},
		reverse: {
			message:
				"Array.reverse() mutates the array; use Array.reverse() from Effect",
			suggestion: "Use Array.reverse() from effect which is immutable",
		},
		fill: {
			message: "Array.fill() mutates the array; consider immutable alternatives",
			suggestion: "Use Array.replicate() or Array.makeBy() from effect",
		},
		copyWithin: {
			message:
				"Array.copyWithin() mutates the array; consider immutable alternatives",
			suggestion: "Use Array module functions for immutable operations",
		},
	};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Track variables initialized as empty objects that might be used for grouping
	const emptyObjectVars = new Set<string>();

	// Track filter calls to detect duplicate filtering
	const filterCalls: Array<{
		node: ts.CallExpression;
		arrayName: string;
		predicateText: string;
	}> = [];

	const visit = (node: ts.Node) => {
		// -------------------------------------------------------------------------
		// Detect filter().map() or map().filter() chains
		// -------------------------------------------------------------------------
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const outerMethod = node.expression.name.text;
			const inner = node.expression.expression;

			if (
				ts.isCallExpression(inner) &&
				ts.isPropertyAccessExpression(inner.expression)
			) {
				const innerMethod = inner.expression.name.text;

				// Check for filter().map() or map().filter()
				if (
					(outerMethod === "map" && innerMethod === "filter") ||
					(outerMethod === "filter" && innerMethod === "map")
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"filter() then map() chain; use Array.filterMap for single pass",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "definite",
						suggestion:
							"Use Array.filterMap(array, (item) => predicate(item) ? Option.some(transform(item)) : Option.none())",
					});
				}
			}
		}

		// -------------------------------------------------------------------------
		// Detect find/findIndex/includes/indexOf calls
		// -------------------------------------------------------------------------
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const method = node.expression.name.text;
			const replacement = findMethods[method];

			if (replacement) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
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

		// -------------------------------------------------------------------------
		// Detect variable initialized as empty object (for grouping pattern)
		// -------------------------------------------------------------------------
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

		// -------------------------------------------------------------------------
		// Detect for...of loop with grouping pattern
		// -------------------------------------------------------------------------
		if (ts.isForOfStatement(node)) {
			const body = node.statement;
			const bodyText = body.getText(sourceFile);

			// Check if body contains pattern: obj[key] = [] or obj[key].push(...)
			for (const varName of emptyObjectVars) {
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

		// -------------------------------------------------------------------------
		// Detect new Map() (suggest HashMap)
		// -------------------------------------------------------------------------
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

		// -------------------------------------------------------------------------
		// Detect array[0] access (should use Array.head)
		// -------------------------------------------------------------------------
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
					ruleId: meta.id,
					category: meta.category,
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
					ruleId: meta.id,
					category: meta.category,
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

		// -------------------------------------------------------------------------
		// Detect .length === 0 or .length > 0 checks
		// -------------------------------------------------------------------------
		if (
			ts.isBinaryExpression(node) &&
			ts.isPropertyAccessExpression(node.left) &&
			node.left.name.text === "length"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
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

		// -------------------------------------------------------------------------
		// Detect [...new Set()] pattern
		// -------------------------------------------------------------------------
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
					ruleId: meta.id,
					category: meta.category,
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

		// -------------------------------------------------------------------------
		// Detect new Set() generally (suggest HashSet)
		// -------------------------------------------------------------------------
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "Set"
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
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

		// -------------------------------------------------------------------------
		// Detect mutating array methods (push, pop, splice, etc.)
		// -------------------------------------------------------------------------
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const methodName = node.expression.name.text;
			const replacement = mutatingMethods[methodName];

			if (replacement) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: replacement.message,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "potential",
					suggestion: replacement.suggestion,
				});
			}
		}

		// -------------------------------------------------------------------------
		// Detect filtering same array twice with opposite conditions
		// -------------------------------------------------------------------------
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "filter"
		) {
			const arrayExpr = node.expression.expression;
			const arrayName = arrayExpr.getText(sourceFile);

			if (node.arguments.length > 0) {
				const predicateText = node.arguments[0].getText(sourceFile);

				// Check if we've seen a filter on the same array
				for (const existing of filterCalls) {
					if (existing.arrayName === arrayName) {
						// Check for opposite conditions
						const isOpposite =
							(predicateText.includes("!") &&
								!existing.predicateText.includes("!")) ||
							(!predicateText.includes("!") &&
								existing.predicateText.includes("!")) ||
							predicateText.includes("!==") !==
								existing.predicateText.includes("!==") ||
							predicateText.includes("!=") !==
								existing.predicateText.includes("!=") ||
							(predicateText.includes("<") &&
								existing.predicateText.includes(">=")) ||
							(predicateText.includes(">=") &&
								existing.predicateText.includes("<")) ||
							(predicateText.includes(">") &&
								existing.predicateText.includes("<=")) ||
							(predicateText.includes("<=") &&
								existing.predicateText.includes(">"));

						if (isOpposite) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Filtering same array twice with opposite conditions; use Array.partition",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, 100),
								severity: "warning",
								certainty: "potential",
								suggestion: `Use Array.partition(${arrayName}, predicate) to split into [matching, nonMatching] in one pass`,
							});
						}
					}
				}

				filterCalls.push({ node, arrayName, predicateText });
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
