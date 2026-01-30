/**
 * imperative rules index
 *
 * This file exports all rules in the imperative category.
 */

export { inserted, removed } from "./rule-001/rule-001.js";
export { obj } from "./rule-002/rule-002.js";
export { goodExample as rule003Example } from "./rule-003/rule-003.js";
export { total } from "./rule-004/rule-004.js";
export { goodExample as rule005Example } from "./rule-005/rule-005.js";
export { allTags } from "./rule-006/rule-006.js";
export { goodExample as rule007Example } from "./rule-007/rule-007.js";
export { processTree } from "./rule-008/rule-008.js";
export { adults, minors } from "./rule-009/rule-009.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "imperative",
		name: "array-splice-modification",
		rule: "Never mutate variables (let, push, pop, splice); use immutable operations",
	},
	{
		id: "rule-002",
		category: "imperative",
		name: "building-object-mutation",
		rule: "Never reassign variables; use functional transformation",
	},
	{
		id: "rule-003",
		category: "imperative",
		name: "chunked-processing",
		rule: "Never use manual batching for large sequences; use Stream",
	},
	{
		id: "rule-004",
		category: "imperative",
		name: "conditional-accumulation",
		rule: "Never use for...of/for...in; use Array module functions",
	},
	{
		id: "rule-005",
		category: "imperative",
		name: "effectful-iteration",
		rule: "Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach",
	},
	{
		id: "rule-006",
		category: "imperative",
		name: "flattening-nested-arrays",
		rule: "Never use nested for loops; use Array.flatMap",
	},
	{
		id: "rule-007",
		category: "imperative",
		name: "limited-concurrency",
		rule: "Never use manual batching loops; use Effect.all with concurrency",
	},
	{
		id: "rule-008",
		category: "imperative",
		name: "recursive-effect-processing",
		rule: "Never use imperative loops for tree traversal; use recursion with Effect",
	},
	{
		id: "rule-009",
		category: "imperative",
		name: "splitting-array-by-condition",
		rule: "Never filter twice with opposite conditions; use Array.partition",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
