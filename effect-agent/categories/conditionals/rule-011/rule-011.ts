// Rule: Never use type predicate functions with || chains; define a Schema.Union and use Match.when with Schema.is
// Example: Using Schema.Union with Match for type discrimination
// @rule-id: rule-011
// @category: conditionals
// @original-name: type-predicate-union-schema

import { Match, Schema } from "effect";
import * as ts from "typescript";

// ✅ Good: Define union schema with type refinements
const FunctionNode = Schema.Union(
	Schema.declare((u): u is ts.FunctionDeclaration =>
		ts.isFunctionDeclaration(u as ts.Node),
	),
	Schema.declare((u): u is ts.FunctionExpression =>
		ts.isFunctionExpression(u as ts.Node),
	),
	Schema.declare((u): u is ts.ArrowFunction =>
		ts.isArrowFunction(u as ts.Node),
	),
);

// ✅ Good: Define union schema for loop statements
const LoopStatement = Schema.Union(
	Schema.declare((u): u is ts.ForStatement => ts.isForStatement(u as ts.Node)),
	Schema.declare((u): u is ts.WhileStatement =>
		ts.isWhileStatement(u as ts.Node),
	),
	Schema.declare((u): u is ts.DoStatement => ts.isDoStatement(u as ts.Node)),
);

// ✅ Good: Define union schema for declarations
const DeclarationNode = Schema.Union(
	Schema.declare((u): u is ts.VariableDeclaration =>
		ts.isVariableDeclaration(u as ts.Node),
	),
	Schema.declare((u): u is ts.FunctionDeclaration =>
		ts.isFunctionDeclaration(u as ts.Node),
	),
	Schema.declare((u): u is ts.ClassDeclaration =>
		ts.isClassDeclaration(u as ts.Node),
	),
);

// ✅ Good: Use Match.when with Schema.is for pattern matching
const handleFunctionNode = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(Schema.is(FunctionNode), (fn) => `Found function at ${fn.pos}`),
		Match.orElse(() => "Not a function node"),
	);

// ✅ Good: Use Match.when with Schema.is for loop handling
const handleLoopStatement = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(Schema.is(LoopStatement), (loop) => `Found loop at ${loop.pos}`),
		Match.orElse(() => "Not a loop statement"),
	);

// ✅ Good: Use Match.when with Schema.is for declarations
const handleDeclaration = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(
			Schema.is(DeclarationNode),
			(decl) => `Found declaration at ${decl.pos}`,
		),
		Match.orElse(() => "Not a declaration node"),
	);

export {
	FunctionNode,
	LoopStatement,
	DeclarationNode,
	handleFunctionNode,
	handleLoopStatement,
	handleDeclaration,
};
