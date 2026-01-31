// Rule: Never use imperative conditionals; define Schema types and use Match.when with Schema.is
// @rule-id: rule-002
// @category: conditionals
// @original-name: schema-conditionals

import { Function, Match, Schema } from "effect";
import * as ts from "typescript";
import type { User } from "../../_fixtures.js";

// =============================================================================
// Example 1: Literal Union Matching
// =============================================================================

const Weekend = Schema.Literal("Saturday", "Sunday");

// Good: Match.when with Schema.is for literal union
const isWeekend = Match.type<string>().pipe(
	Match.when(Schema.is(Weekend), Function.constant(true)),
	Match.orElse(Function.constant(false)),
);

// =============================================================================
// Example 2: Struct Condition Matching
// =============================================================================

const VerifiedAdmin = Schema.Struct({
	role: Schema.Literal("admin"),
	verified: Schema.Literal(true),
});

// Good: Match.when with Schema.is for struct conditions
const canDelete = Match.type<User>().pipe(
	Match.when(Schema.is(VerifiedAdmin), Function.constant(true)),
	Match.orElse(Function.constant(false)),
);

// =============================================================================
// Example 3: Multi-Condition Assignment
// =============================================================================

const Condition1Active = Schema.Struct({
	condition1: Schema.Literal(true),
	condition2: Schema.Boolean,
});

const Condition2Active = Schema.Struct({
	condition1: Schema.Literal(false),
	condition2: Schema.Literal(true),
});

declare const condition1: boolean;
declare const condition2: boolean;
declare const value1: string;
declare const value2: string;
declare const defaultValue: string;

// Good: Match.when with Schema.is for conditional assignment
const assignmentResult = Match.value({ condition1, condition2 }).pipe(
	Match.when(Schema.is(Condition1Active), Function.constant(value1)),
	Match.when(Schema.is(Condition2Active), Function.constant(value2)),
	Match.orElse(Function.constant(defaultValue)),
);

// =============================================================================
// Example 4: Multi-Condition Object Matching
// =============================================================================

class Order extends Schema.Class<Order>("Order")({
	total: Schema.Number,
	isPremium: Schema.Boolean,
}) {}

const HighValue = Schema.Struct({
	total: Schema.Number.pipe(Schema.greaterThan(1000)),
	isPremium: Schema.Boolean,
});

const HighValuePremium = Schema.Struct({
	total: Schema.Number.pipe(Schema.greaterThan(1000)),
	isPremium: Schema.Literal(true),
});

const Premium = Schema.Struct({
	total: Schema.Number,
	isPremium: Schema.Literal(true),
});

// Good: Match.when with Schema.is predicates
const calculateDiscount = (order: Order) =>
	Match.value(order).pipe(
		Match.when(Schema.is(HighValuePremium), Function.constant(0.25)),
		Match.when(Schema.is(HighValue), Function.constant(0.15)),
		Match.when(Schema.is(Premium), Function.constant(0.1)),
		Match.orElse(Function.constant(0)),
	);

// =============================================================================
// Example 5: Numeric Classification
// =============================================================================

const Zero = Schema.Literal(0);
const Negative = Schema.Number.pipe(Schema.negative());
const Positive = Schema.Number.pipe(Schema.positive());

// Good: Match.when with Schema.is for numeric classification
const classify = Match.type<number>().pipe(
	Match.when(Schema.is(Zero), Function.constant("zero")),
	Match.when(Schema.is(Negative), Function.constant("negative")),
	Match.when(Schema.is(Positive), Function.constant("positive")),
	Match.exhaustive,
);

// =============================================================================
// Example 6: Type Predicate Replacement with Schema.Union
// =============================================================================

// Good: Define union schema with type refinements
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

// Good: Define union schema for loop statements
const LoopStatement = Schema.Union(
	Schema.declare((u): u is ts.ForStatement => ts.isForStatement(u as ts.Node)),
	Schema.declare((u): u is ts.WhileStatement =>
		ts.isWhileStatement(u as ts.Node),
	),
	Schema.declare((u): u is ts.DoStatement => ts.isDoStatement(u as ts.Node)),
);

// Good: Define union schema for declarations
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

// Good: Use Match.when with Schema.is for pattern matching
const handleFunctionNode = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(Schema.is(FunctionNode), (fn) => `Found function at ${fn.pos}`),
		Match.orElse(() => "Not a function node"),
	);

// Good: Use Match.when with Schema.is for loop handling
const handleLoopStatement = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(Schema.is(LoopStatement), (loop) => `Found loop at ${loop.pos}`),
		Match.orElse(() => "Not a loop statement"),
	);

// Good: Use Match.when with Schema.is for declarations
const handleDeclaration = (node: ts.Node) =>
	Match.value(node).pipe(
		Match.when(
			Schema.is(DeclarationNode),
			(decl) => `Found declaration at ${decl.pos}`,
		),
		Match.orElse(() => "Not a declaration node"),
	);

export {
	// Example 1
	isWeekend,
	// Example 2
	canDelete,
	// Example 3
	assignmentResult,
	// Example 4
	calculateDiscount,
	// Example 5
	classify,
	// Example 6
	FunctionNode,
	LoopStatement,
	DeclarationNode,
	handleFunctionNode,
	handleLoopStatement,
	handleDeclaration,
};
