/**
 * conditionals rules index
 *
 * This file exports all rules in the conditionals category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";
export * from "./rule-008/rule-008.js";
export * from "./rule-010/rule-010.js";
export * from "./rule-011/rule-011.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "conditionals",
		name: "array-empty-check",
		rule: "Never use array empty checks; use Array.match",
	},
	{
		id: "rule-002",
		category: "conditionals",
		name: "match-literal-union",
		rule: "Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is",
	},
	{
		id: "rule-003",
		category: "conditionals",
		name: "match-struct-conditions",
		rule: "Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is",
	},
	{
		id: "rule-004",
		category: "conditionals",
		name: "multi-condition-assignment",
		rule: "Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is",
	},
	{
		id: "rule-005",
		category: "conditionals",
		name: "multi-condition-matching",
		rule: "Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is",
	},
	{
		id: "rule-006",
		category: "conditionals",
		name: "nullable-option-match",
		rule: "Never use null checks (if x != null); use Option.match",
	},
	{
		id: "rule-007",
		category: "conditionals",
		name: "numeric-classification",
		rule: "Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is",
	},
	{
		id: "rule-008",
		category: "conditionals",
		name: "result-effect-match",
		rule: "Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass",
	},
	{
		id: "rule-010",
		category: "conditionals",
		name: "ternary-to-match",
		rule: "Never use ternary operators; define Schema types for each range and use Match.when with Schema.is",
	},
	{
		id: "rule-011",
		category: "conditionals",
		name: "type-predicate-union-schema",
		rule: "Never use type predicate functions with || chains; define a Schema.Union and use Match.when with Schema.is",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
