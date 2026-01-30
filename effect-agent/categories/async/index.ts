/**
 * async rules index
 *
 * This file exports all rules in the async category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";
export * from "./rule-008/rule-008.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "async",
		name: "callback-api",
		rule: "Never use new Promise(); use Effect.async for callback-based APIs",
	},
	{
		id: "rule-002",
		category: "async",
		name: "generator-yield",
		rule: "Never use yield or await in Effect.gen; use yield*",
	},
	{
		id: "rule-003",
		category: "async",
		name: "http-handler-boundary",
		rule: "Never use Effect.runPromise except at application boundaries",
	},
	{
		id: "rule-004",
		category: "async",
		name: "parallel-results",
		rule: "Never use Promise.all; use Effect.all",
	},
	{
		id: "rule-005",
		category: "async",
		name: "promise-chain",
		rule: "Never use Promise chains (.then); use pipe with Effect.map/flatMap",
	},
	{
		id: "rule-006",
		category: "async",
		name: "race-operations",
		rule: "Never use Promise.race; use Effect.race or Effect.raceAll",
	},
	{
		id: "rule-007",
		category: "async",
		name: "repeated-execution",
		rule: "Never use setTimeout/setInterval; use Effect.sleep and Schedule",
	},
	{
		id: "rule-008",
		category: "async",
		name: "wrap-external-async",
		rule: "Never use async functions; use Effect.gen with yield*",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
