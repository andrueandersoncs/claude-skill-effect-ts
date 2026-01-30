/**
 * errors rules index
 *
 * This file exports all rules in the errors category.
 */

export * from "./rule-001/rule-001.js";
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
export * from "./rule-012/rule-012.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "errors",
		name: "all-either-mode",
		rule: 'Never use fail-fast Promise.all; use Effect.all with mode: "either"',
	},
	{
		id: "rule-002",
		category: "errors",
		name: "catch-tag",
		rule: "Never check error._tag manually; use Effect.catchTag",
	},
	{
		id: "rule-003",
		category: "errors",
		name: "catch-tags",
		rule: "Never use switch on error._tag; use Effect.catchTags",
	},
	{
		id: "rule-004",
		category: "errors",
		name: "conditional-fail",
		rule: "Never use throw statements; use Effect.fail()",
	},
	{
		id: "rule-005",
		category: "errors",
		name: "effect-try-promise",
		rule: "Never use try/catch with async; use Effect.tryPromise()",
	},
	{
		id: "rule-006",
		category: "errors",
		name: "effect-try",
		rule: "Never use try/catch blocks; use Effect.try()",
	},
	{
		id: "rule-007",
		category: "errors",
		name: "map-error",
		rule: "Never rethrow transformed errors; use Effect.mapError",
	},
	{
		id: "rule-008",
		category: "errors",
		name: "or-else-fallback",
		rule: "Never use catchAll for fallbacks; use Effect.orElse",
	},
	{
		id: "rule-009",
		category: "errors",
		name: "retry-schedule",
		rule: "Never use manual retry loops; use Effect.retry with Schedule",
	},
	{
		id: "rule-010",
		category: "errors",
		name: "sandbox-catch-tags",
		rule: "Never use try/catch for Effect errors; use Effect.sandbox with catchTags",
	},
	{
		id: "rule-011",
		category: "errors",
		name: "timeout-fail",
		rule: "Never use setTimeout for timeouts; use Effect.timeout",
	},
	{
		id: "rule-012",
		category: "errors",
		name: "typed-errors",
		rule: "Never use untyped errors; use Schema.TaggedError",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
