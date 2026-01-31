/**
 * rule-002: schema-conditionals
 *
 * Rule: Never use imperative conditionals (if/else, switch, ||, &&);
 * define Schema types and use Match.when with Schema.is for declarative pattern matching.
 *
 * This detector consolidates multiple related patterns:
 * 1. Literal unions - || chains comparing literals
 * 2. Struct conditions - && chains checking object properties
 * 3. Multi-condition assignment - let + if/else reassignment
 * 4. Multi-condition matching - if/else chains
 * 5. Numeric classification - numeric comparisons
 * 6. Type predicate replacement - type predicate functions with || chains
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "conditionals",
	name: "schema-conditionals",
};

// =============================================================================
// Helper Functions
// =============================================================================

const countOrConditions = (node: ts.Node): number => {
	if (
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.BarBarToken
	) {
		return 1 + countOrConditions(node.left) + countOrConditions(node.right);
	}
	return 0;
};

const countAndConditions = (node: ts.Node): number => {
	if (
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
	) {
		return 1 + countAndConditions(node.left) + countAndConditions(node.right);
	}
	return 0;
};

const isTypePredicateReturnType = (node: ts.TypeNode | undefined): boolean => {
	return node !== undefined && ts.isTypePredicateNode(node);
};

const getReturnType = (
	node:
		| ts.FunctionDeclaration
		| ts.FunctionExpression
		| ts.ArrowFunction
		| ts.MethodDeclaration,
): ts.TypeNode | undefined => {
	return node.type;
};

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
		return countOrConditions(body) >= 1;
	}

	// Function with block body - check for return statement
	if (ts.isBlock(body)) {
		for (const statement of body.statements) {
			if (ts.isReturnStatement(statement) && statement.expression) {
				if (countOrConditions(statement.expression) >= 1) {
					return true;
				}
			}
		}
	}

	return false;
};

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

// =============================================================================
// Main Detector
// =============================================================================

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// =========================================================================
		// Pattern 1: Multiple OR conditions comparing literals
		// =========================================================================
		if (ts.isIfStatement(node)) {
			const condition = node.expression;
			const orCount = countOrConditions(condition);

			if (orCount >= 1) {
				const conditionText = condition.getText(sourceFile);
				const isLiteralComparison =
					conditionText.includes("===") || conditionText.includes("==");

				if (isLiteralComparison) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Multiple OR conditions comparing literals; use Schema.Literal union with Match",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: conditionText.slice(0, 100),
						severity: "warning",
						certainty: "potential",
						suggestion:
							"Define Schema.Literal('a', 'b', ...) and use Match.when(Schema.is(union), ...)",
					});
				}
			}

			// =========================================================================
			// Pattern 2: Multiple AND conditions
			// =========================================================================
			const andCount = countAndConditions(condition);

			if (andCount >= 1) {
				const conditionText = condition.getText(sourceFile);
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Multiple AND conditions; consider Schema.Struct with Match.when",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: conditionText.slice(0, 100),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Define Schema.Struct({ prop1: Schema.filter(...), prop2: ... }) and use Match.when(Schema.is(struct), ...)",
				});
			}

			// =========================================================================
			// Pattern 5: Negated conditions and numeric comparisons
			// =========================================================================
			// Check for leading negation (!)
			if (ts.isPrefixUnaryExpression(condition)) {
				if (condition.operator === ts.SyntaxKind.ExclamationToken) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Negated condition in if statement; prefer positive conditions with Match",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: condition.getText(sourceFile).slice(0, 80),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Define positive Schema types for each case and use Match.when with Schema.is",
					});
				}
			}

			// Check for numeric comparisons that could be classified
			const condText = condition.getText(sourceFile);
			if (
				(condText.includes("<") ||
					condText.includes(">") ||
					condText.includes("<=") ||
					condText.includes(">=")) &&
				node.elseStatement
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Numeric range classification with if/else chain; use Schema with Match",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: condText.slice(0, 80),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Define Schema.Number.pipe(Schema.filter(n => ...)) for each range and use Match.when(Schema.is(range), ...)",
				});
			}
		}

		// =========================================================================
		// Pattern 3: Variable with conditional reassignment
		// =========================================================================
		if (ts.isVariableStatement(node)) {
			const declarations = node.declarationList.declarations;
			if (
				node.declarationList.flags & ts.NodeFlags.Let &&
				declarations.length === 1
			) {
				const decl = declarations[0];
				const varName = decl.name.getText(sourceFile);

				// Look at the next sibling for if statement
				const parent = node.parent;
				if (ts.isBlock(parent) || ts.isSourceFile(parent)) {
					const statements = parent.statements
						? Array.from(parent.statements)
						: [];
					const idx = statements.indexOf(node);
					if (idx >= 0 && idx + 1 < statements.length) {
						const nextStmt = statements[idx + 1];
						if (ts.isIfStatement(nextStmt)) {
							// Check if the if body assigns to our variable
							const ifText = nextStmt.getText(sourceFile);
							if (
								ifText.includes(`${varName} =`) ||
								ifText.includes(`${varName}=`)
							) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: meta.id,
									category: meta.category,
									message:
										"Variable with conditional reassignment; use Match.value for declarative assignment",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: `let ${varName} = ... followed by if/else assignment`,
									severity: "warning",
									certainty: "potential",
									suggestion:
										"Use Match.value(input).pipe(Match.when(..., () => value1), Match.when(..., () => value2), Match.exhaustive)",
								});
							}
						}
					}
				}
			}
		}

		// =========================================================================
		// Pattern 4: Short-circuit evaluation in value context
		// =========================================================================
		if (ts.isBinaryExpression(node)) {
			const operator = node.operatorToken.kind;
			if (
				operator === ts.SyntaxKind.BarBarToken ||
				operator === ts.SyntaxKind.AmpersandAmpersandToken
			) {
				const parent = node.parent;
				if (
					parent &&
					(ts.isVariableDeclaration(parent) ||
						ts.isReturnStatement(parent) ||
						ts.isPropertyAssignment(parent) ||
						ts.isCallExpression(parent))
				) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message:
							"Short-circuit evaluation may be clearer with Match or Option",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 100),
						severity: "info",
						certainty: "potential",
						suggestion:
							"Consider Match.value() or Option.getOrElse() for clarity",
					});
				}
			}
		}

		// =========================================================================
		// Pattern 6: Type predicate functions with || chains
		// =========================================================================
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
