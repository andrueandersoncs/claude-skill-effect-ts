// Rule: Never use type predicate functions with || chains; define a Schema.Union and use Match.when with Schema.is
// Example: Type predicate with || chain (bad example)
// @rule-id: rule-011
// @category: conditionals
// @original-name: type-predicate-union-schema

import * as ts from "typescript";

// ❌ Bad: Type predicate function with || chain
const isFunctionNode = (
	node: ts.Node,
): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
	ts.isFunctionDeclaration(node) ||
	ts.isFunctionExpression(node) ||
	ts.isArrowFunction(node);

// ❌ Bad: Another type predicate with || chain
const isLoopStatement = (
	node: ts.Node,
): node is ts.ForStatement | ts.WhileStatement | ts.DoStatement =>
	ts.isForStatement(node) ||
	ts.isWhileStatement(node) ||
	ts.isDoStatement(node);

// ❌ Bad: Type predicate checking multiple declaration types
const isDeclarationNode = (
	node: ts.Node,
): node is
	| ts.VariableDeclaration
	| ts.FunctionDeclaration
	| ts.ClassDeclaration =>
	ts.isVariableDeclaration(node) ||
	ts.isFunctionDeclaration(node) ||
	ts.isClassDeclaration(node);

export { isFunctionNode, isLoopStatement, isDeclarationNode };
