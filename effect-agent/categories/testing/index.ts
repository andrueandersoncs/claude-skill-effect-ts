/**
 * testing rules index
 *
 * This file exports all rules in the testing category.
 */

export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";
export * from "./rule-008/rule-008.js";
export * from "./rule-010/rule-010.js";
export * from "./rule-012/rule-012.js";
export * from "./rule-014/rule-014.js";
export * from "./rule-015/rule-015.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-003",
		category: "testing",
		name: "effect-exit",
		rule: "Never use try/catch for error assertions; use Effect.exit",
	},
	{
		id: "rule-004",
		category: "testing",
		name: "effect-vitest-imports",
		rule: "Never import from vitest directly; use @effect/vitest",
	},
	{
		id: "rule-005",
		category: "testing",
		name: "equality-testers",
		rule: "Never skip addEqualityTesters(); call it for Effect type equality",
	},
	{
		id: "rule-006",
		category: "testing",
		name: "property-based-testing",
		rule: "Use property-based testing with Schema: it.prop, it.effect.prop, and Arbitrary.make",
	},
	{
		id: "rule-007",
		category: "testing",
		name: "it-effect",
		rule: "Never use Effect.runPromise in tests; use it.effect from @effect/vitest",
	},
	{
		id: "rule-008",
		category: "testing",
		name: "it-live",
		rule: "Never use it.effect when you need real time; use it.live",
	},
	{
		id: "rule-010",
		category: "testing",
		name: "it-scoped",
		rule: "Never manage resources manually in tests; use it.scoped",
	},
	{
		id: "rule-012",
		category: "testing",
		name: "layer-test",
		rule: "Never use live services in tests; use layer() from @effect/vitest",
	},
	{
		id: "rule-014",
		category: "testing",
		name: "schema-constraints",
		rule: "Never use fast-check .filter(); use Schema constraints",
	},
	{
		id: "rule-015",
		category: "testing",
		name: "test-clock",
		rule: "Never provide TestClock.layer manually; it.effect includes it automatically",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
