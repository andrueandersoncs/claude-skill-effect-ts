/**
 * schema rules index
 *
 * This file exports all rules in the schema category.
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
export * from "./rule-013/rule-013.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "schema",
		name: "branded-ids",
		rule: "Never use raw primitives for IDs; use Schema.brand",
	},
	{
		id: "rule-002",
		category: "schema",
		name: "no-plain-error",
		rule: "Never extend plain Error class; use Schema.TaggedError",
	},
	{
		id: "rule-003",
		category: "schema",
		name: "parse-json",
		rule: "Never use JSON.parse(); use Schema.parseJson()",
	},
	{
		id: "rule-004",
		category: "schema",
		name: "schema-class-methods",
		rule: "Never use Schema.Struct for entities with methods; use Schema.Class",
	},
	{
		id: "rule-005",
		category: "schema",
		name: "schema-class",
		rule: "Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass",
	},
	{
		id: "rule-006",
		category: "schema",
		name: "schema-constructor",
		rule: "Never construct object literals; use Schema class constructors",
	},
	{
		id: "rule-007",
		category: "schema",
		name: "schema-filters",
		rule: "Never use manual validation functions; use Schema filters",
	},
	{
		id: "rule-008",
		category: "schema",
		name: "schema-literal",
		rule: "Never use TypeScript enum; use Schema.Literal",
	},
	{
		id: "rule-009",
		category: "schema",
		name: "schema-tagged-error",
		rule: "Never use Data.TaggedError; use Schema.TaggedError",
	},
	{
		id: "rule-010",
		category: "schema",
		name: "schema-transform",
		rule: "Never use manual type conversions; use Schema.transform",
	},
	{
		id: "rule-011",
		category: "schema",
		name: "schema-union",
		rule: "Never use TypeScript union types; use Schema.Union of TaggedClass",
	},
	{
		id: "rule-012",
		category: "schema",
		name: "schema-unknown-legitimate",
		rule: "Never use Schema.Any/Schema.Unknown unless genuinely unconstrained",
	},
	{
		id: "rule-013",
		category: "schema",
		name: "tagged-union-state",
		rule: "Never use optional properties for state; use tagged unions",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
