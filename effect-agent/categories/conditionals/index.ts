/**
 * conditionals rules index
 *
 * This file exports all rules in the conditionals category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-008/rule-008.js";
export * from "./rule-009/rule-009.js";
export * from "./rule-010/rule-010.js";

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
		name: "schema-conditionals",
		rule: "Never use imperative conditionals (if/else, switch, ||, &&); define Schema types and use Match.when with Schema.is",
	},
	{
		id: "rule-006",
		category: "conditionals",
		name: "nullable-option-match",
		rule: "Never use null checks (if x != null); use Option.match",
	},
	{
		id: "rule-008",
		category: "conditionals",
		name: "result-effect-match",
		rule: "Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass",
	},
	{
		id: "rule-009",
		category: "conditionals",
		name: "switch-to-match-tag",
		rule: "Never use switch/case statements; use Match.type with Match.tag for discriminated unions",
	},
	{
		id: "rule-010",
		category: "conditionals",
		name: "ternary-to-match",
		rule: "Never use ternary operators; define Schema types for each range and use Match.when with Schema.is",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
