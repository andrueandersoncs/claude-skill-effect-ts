/**
 * discriminated-unions rules index
 *
 * This file exports all rules in the discriminated-unions category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "discriminated-unions",
		name: "match-tag-dispatch",
		rule: "Never use if/else on ._tag; use Match.tag for discriminated unions",
	},
	{
		id: "rule-002",
		category: "discriminated-unions",
		name: "partitioning-by-tag",
		rule: "Never use ._tag in array predicates; use Schema.is(Variant)",
	},
	{
		id: "rule-003",
		category: "discriminated-unions",
		name: "runtime-validation",
		rule: "Never cast unknown to check ._tag; use Schema.is() for validation",
	},
	{
		id: "rule-004",
		category: "discriminated-unions",
		name: "schema-is-vs-match-tag",
		rule: "Never use Match.tag when you need class methods; use Schema.is()",
	},
	{
		id: "rule-006",
		category: "discriminated-unions",
		name: "switch-on-tag",
		rule: "Never check ._tag directly; use Schema.is(Variant)",
	},
	{
		id: "rule-007",
		category: "discriminated-unions",
		name: "use-union-directly",
		rule: "Never extract types from ._tag; use the union type directly",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
