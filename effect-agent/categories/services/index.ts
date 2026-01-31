/**
 * services rules index
 *
 * This file exports all rules in the services category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-006/rule-006.js";
export * from "./rule-007/rule-007.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "services",
		name: "context-tag-dependencies",
		rule: "Never call external dependencies directly; always wrap them in a Context.Tag service",
	},
	{
		id: "rule-004",
		category: "services",
		name: "layer-composition",
		rule: "Never provide services ad-hoc; compose layers with Layer.mergeAll/provide",
	},
	{
		id: "rule-005",
		category: "services",
		name: "layer-effect",
		rule: "Never create services inline; use Layer.effect or Layer.succeed",
	},
	{
		id: "rule-006",
		category: "services",
		name: "live-and-test-layers",
		rule: "Never create a service without both *Live and *Test layers",
	},
	{
		id: "rule-007",
		category: "services",
		name: "stateful-test-layer",
		rule: "Never use stateless test mocks; use Layer.effect with Ref for state",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
