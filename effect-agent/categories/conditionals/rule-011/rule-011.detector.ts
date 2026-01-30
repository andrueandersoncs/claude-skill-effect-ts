/**
 * rule-011: type-predicate-union-schema
 *
 * Rule: Never use type predicate functions with || chains; define a Schema.Union and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "conditionals",
	name: "type-predicate-union-schema",
};

/**
 * Counts the number of OR (||) operators in an expression
 */
const countOrOperators = (node: ts.Node): number => {
	if (
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.BarBarToken
	) {
		return 1 + countOrOperators(node.left) + countOrOperators(node.right);
	}
	return 0;
};

/**
 * Checks if a node is a type predicate return type (: x is Y)
 */
const isTypePredicateReturnType = (node: ts.TypeNode | undefined): boolean => {
	return node !== undefined && ts.isTypePredicateNode(node);
};

/**
 * Gets the return type node from a function-like declaration
 */
const getReturnType = (
	node:
		| ts.FunctionDeclaration
		| ts.FunctionExpression
		| ts.ArrowFunction
		| ts.MethodDeclaration,
): ts.TypeNode | undefined => {
	return node.type;
};

/**
 * Checks if the function body is a simple || chain expression
 */
const isOrChainBody = (
	node:
		| ts.FunctionDeclaration
		| ts.FunctionExpression
		| ts.ArrowFunction
		| ts.MethodDeclaration,
): boolean => {
	const body = node.body;
	if (!body) return false;

	// Arrow function with expression body
	if (ts.isArrowFunction(node) && !ts.isBlock(body)) {
		return countOrOperators(body) >= 1;
	}

	// Function with block body - check for return statement
	if (ts.isBlock(body)) {
		for (const statement of body.statements) {
			if (ts.isReturnStatement(statement) && statement.expression) {
				if (countOrOperators(statement.expression) >= 1) {
					return true;
				}
			}
		}
	}

	return false;
};

/**
 * Gets the || chain expression text from a function body
 */
const getOrChainText = (
	node:
		| ts.FunctionDeclaration
		| ts.FunctionExpression
		| ts.ArrowFunction
		| ts.MethodDeclaration,
	sourceFile: ts.SourceFile,
): string => {
	const body = node.body;
	if (!body) return "";

	// Arrow function with expression body
	if (ts.isArrowFunction(node) && !ts.isBlock(body)) {
		return body.getText(sourceFile);
	}

	// Function with block body
	if (ts.isBlock(body)) {
		for (const statement of body.statements) {
			if (ts.isReturnStatement(statement) && statement.expression) {
				return statement.expression.getText(sourceFile);
			}
		}
	}

	return "";
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Check function declarations, expressions, arrow functions, and methods
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isArrowFunction(node) ||
			ts.isMethodDeclaration(node)
		) {
			const returnType = getReturnType(node);

			// Check if it has a type predicate return type (: x is Y)
			if (isTypePredicateReturnType(returnType)) {
				// Check if body is an || chain
				if (isOrChainBody(node)) {
					const orChainText = getOrChainText(node, sourceFile);
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);

					// Get function name if available
					let functionName = "<anonymous>";
					if (ts.isFunctionDeclaration(node) && node.name) {
						functionName = node.name.getText(sourceFile);
					} else if (ts.isMethodDeclaration(node) && node.name) {
						functionName = node.name.getText(sourceFile);
					} else if (
						ts.isVariableDeclaration(node.parent) &&
						ts.isIdentifier(node.parent.name)
					) {
						functionName = node.parent.name.getText(sourceFile);
					}

					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `Type predicate function '${functionName}' uses || chain; define a Schema.Union and use Match.when with Schema.is`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: orChainText.slice(0, 150),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Define Schema.Union(Schema.declare(...), ...) for each type guard and use Match.when(Schema.is(union), ...) for pattern matching",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
