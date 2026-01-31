/**
 * services rules index
 *
 * This file exports all rules in the services category.
 */

export * from "./rule-001/rule-001.js";
export * from "./rule-002/rule-002.js";
export * from "./rule-003/rule-003.js";
export * from "./rule-004/rule-004.js";
export * from "./rule-005/rule-005.js";
export * from "./rule-008/rule-008.js";

/**
 * Rule metadata for this category
 */
export const rules = [
	{
		id: "rule-001",
		category: "services",
		name: "context-tag-api",
		rule: "Never call external APIs directly; use a Context.Tag service",
	},
	{
		id: "rule-002",
		category: "services",
		name: "context-tag-filesystem",
		rule: "Never use direct file I/O; use a Context.Tag service",
	},
	{
		id: "rule-003",
		category: "services",
		name: "context-tag-repository",
		rule: "Never access database directly; use a Context.Tag repository",
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
	{
		id: "rule-008",
		category: "services",
		name: "wrap-third-party-sdk",
		rule: "Never call third-party SDKs directly; wrap in a Context.Tag service",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
