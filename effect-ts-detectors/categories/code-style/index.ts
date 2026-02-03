/**
 * code-style rules index
 *
 * This file exports all rules in the code-style category.
 */

export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";
export * from "./rule-008/rule-008.js";
export * from "./rule-009/rule-009.js";
export * from "./rule-010/rule-010.js";
export * from "./rule-011/rule-011.js";
export * from "./rule-013/rule-013.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-002",
		category: "code-style",
		name: "no-type-assertions",
		rule: "Never use type assertions (as, angle brackets, double assertions); use Schema.decodeUnknown or type guards",
	},
	{
		id: "rule-003",
		category: "code-style",
		name: "dynamic-property-access",
		rule: "Never use eslint-disable for any-type errors; use Schema",
	},
	{
		id: "rule-004",
		category: "code-style",
		name: "effect-fn-single-step",
		rule: "Never use Effect.gen for simple single-step effects; use Effect.fn()",
	},
	{
		id: "rule-005",
		category: "code-style",
		name: "effect-fn-transformation",
		rule: "Never write plain functions; use Effect.fn() or Effect.gen()",
	},
	{
		id: "rule-006",
		category: "code-style",
		name: "effect-gen-multi-step",
		rule: "Use Effect.gen() for multi-step sequential operations",
	},
	{
		id: "rule-007",
		category: "code-style",
		name: "exhaustive-match",
		rule: "Never use eslint-disable for exhaustive checks; use Match.exhaustive",
	},
	{
		id: "rule-008",
		category: "code-style",
		name: "fat-arrow-syntax",
		rule: "Never use the function keyword; use fat arrow syntax",
	},
	{
		id: "rule-009",
		category: "code-style",
		name: "fix-types",
		rule: "Never suppress type errors with comments; fix the types",
	},
	{
		id: "rule-010",
		category: "code-style",
		name: "non-null-assertion",
		rule: "Never use ! (non-null assertion); use Option or Effect",
	},
	{
		id: "rule-011",
		category: "code-style",
		name: "ts-imports",
		rule: 'Never import from ".js" files; always import from ".ts" files directly',
	},
	{
		id: "rule-013",
		category: "code-style",
		name: "unused-variable",
		rule: "Never use eslint-disable comments; fix the underlying issue",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
