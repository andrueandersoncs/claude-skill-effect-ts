/**
 * services rules index
 *
 * This file exports all rules in the services category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";

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
		name: "layer-implementation",
		rule: "Never create services inline; use Layer.effect or Layer.succeed with proper Live/Test patterns",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
