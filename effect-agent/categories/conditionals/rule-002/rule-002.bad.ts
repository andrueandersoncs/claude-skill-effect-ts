// Rule: Never use imperative conditionals; define Schema types and use Match.when with Schema.is
// Bad examples showing imperative patterns that should be replaced
// @rule-id: rule-002
// @category: conditionals
// @original-name: schema-conditionals

import * as ts from "typescript";

// =============================================================================
// Bad Example 1: Multiple OR conditions for literal comparison
// =============================================================================

declare const day: string;

// Bad: Using multiple OR conditions instead of Schema.Literal union with Match.when
const isWeekend = (d: string): boolean => {
	if (d === "Saturday" || d === "Sunday") {
		return true;
	}
	return false;
};

// =============================================================================
// Bad Example 2: Combined AND conditions
// =============================================================================

interface UserInput {
	role: string;
	verified: boolean;
}

declare const user: UserInput;

// Bad: Using combined AND conditions instead of Schema.Struct with Match.when
const isVerifiedAdmin = (u: UserInput): boolean => {
	if (u.role === "admin" && u.verified) {
		return true;
	}
	return false;
};

// =============================================================================
// Bad Example 3: Conditional variable reassignment
// =============================================================================

declare const condition1: boolean;
declare const condition2: boolean;
declare const value1: string;
declare const value2: string;
declare const defaultValue: string;

// Bad: Using conditional variable reassignment instead of Match.when
const getResult = (): string => {
	let result = defaultValue;
	if (condition1) {
		result = value1;
	} else if (condition2) {
		result = value2;
	}
	return result;
};

// =============================================================================
// Bad Example 4: If/else chains for object matching
// =============================================================================

interface OrderInput {
	total: number;
	isPremium: boolean;
}

declare const order: OrderInput;

// Bad: Using if/else chains instead of Match.when with Schema-defined predicates
const getDiscount = (o: OrderInput): number => {
	if (o.total > 1000 && o.isPremium) {
		return 0.25;
	} else if (o.total > 1000) {
		return 0.15;
	} else if (o.isPremium) {
		return 0.1;
	} else {
		return 0;
	}
};

// =============================================================================
// Bad Example 5: Negative/numeric conditions
// =============================================================================

declare const n: number;

// Bad: Using negative conditions instead of Match.when with Schema-defined ranges
const classifyNumber = (num: number): string => {
	if (num > 0) {
		return "positive";
	} else {
		return "not positive";
	}
};

// =============================================================================
// Bad Example 6: Type predicate functions with || chains
// =============================================================================

// Bad: Type predicate function with || chain
const isFunctionNode = (
	node: ts.Node,
): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
	ts.isFunctionDeclaration(node) ||
	ts.isFunctionExpression(node) ||
	ts.isArrowFunction(node);

// Bad: Another type predicate with || chain
const isLoopStatement = (
	node: ts.Node,
): node is ts.ForStatement | ts.WhileStatement | ts.DoStatement =>
	ts.isForStatement(node) ||
	ts.isWhileStatement(node) ||
	ts.isDoStatement(node);

// Bad: Type predicate checking multiple declaration types
const isDeclarationNode = (
	node: ts.Node,
): node is
	| ts.VariableDeclaration
	| ts.FunctionDeclaration
	| ts.ClassDeclaration =>
	ts.isVariableDeclaration(node) ||
	ts.isFunctionDeclaration(node) ||
	ts.isClassDeclaration(node);

export {
	// Example 1
	isWeekend,
	day,
	// Example 2
	isVerifiedAdmin,
	user,
	// Example 3
	getResult,
	// Example 4
	getDiscount,
	order,
	// Example 5
	classifyNumber,
	n,
	// Example 6
	isFunctionNode,
	isLoopStatement,
	isDeclarationNode,
};
