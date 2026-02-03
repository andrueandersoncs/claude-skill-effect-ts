/**
 * native-apis rules index
 *
 * This file exports all rules in the native-apis category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-001-array-operations/rule-001-array-operations.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-007/rule-007.js";
export * from "./rule-010/rule-010.js";
export * from "./rule-012/rule-012.js";
export * from "./rule-013/rule-013.js";
export * from "./rule-014/rule-014.js";
export * from "./rule-015/rule-015.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "native-apis",
		name: "composing-two-functions",
		rule: "Never nest two function calls; use Function.compose",
	},
	{
		id: "rule-001-array-operations",
		category: "native-apis",
		name: "array-operations-consolidated",
		rule: "Use Effect's Array module for all array operations (filter, find, map, head, last, dedupe, partition, etc.)",
	},
	{
		id: "rule-002",
		category: "native-apis",
		name: "conditional-transformation",
		rule: "Never use (x) => x; use Function.identity",
	},
	{
		id: "rule-003",
		category: "native-apis",
		name: "converting-to-entries",
		rule: "Never use Object.keys/values/entries; use Record module",
	},
	{
		id: "rule-004",
		category: "native-apis",
		name: "data-transformation-pipeline",
		rule: "Never use native method chaining; use pipe with Effect's Array module",
	},
	{
		id: "rule-007",
		category: "native-apis",
		name: "function-constant-value",
		rule: "Never use () => value; use Function.constant",
	},
	{
		id: "rule-010",
		category: "native-apis",
		name: "omitting-fields",
		rule: "Never use destructuring to omit fields; use Struct.omit",
	},
	{
		id: "rule-012",
		category: "native-apis",
		name: "reusable-pipeline",
		rule: "Never use nested function calls; use flow for composing pipelines",
	},
	{
		id: "rule-013",
		category: "native-apis",
		name: "safe-property-access",
		rule: "Never use record[key]; use Record.get (returns Option)",
	},
	{
		id: "rule-014",
		category: "native-apis",
		name: "struct-predicate",
		rule: "Never use manual &&/|| for predicates; use Predicate.and/or/not",
	},
	{
		id: "rule-015",
		category: "native-apis",
		name: "tuple-transformation",
		rule: "Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
