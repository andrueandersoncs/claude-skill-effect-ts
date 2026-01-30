/**
 * comments rules index
 *
 * This file exports all rules in the comments category.
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
		category: "comments",
		name: "branded-type-definition",
		rule: "Never add JSDoc comments that merely restate the type definition; the types are self-documenting",
	},
	{
		id: "rule-002",
		category: "comments",
		name: "code-organization",
		rule: "Never add section marker comments; use file organization and clear naming instead",
	},
	{
		id: "rule-003",
		category: "comments",
		name: "effect-pipeline",
		rule: "Never add inline comments for obvious Effect patterns; Effect code is self-documenting",
	},
	{
		id: "rule-004",
		category: "comments",
		name: "function-documentation",
		rule: "Never add JSDoc @param/@returns that just repeat the type signature",
	},
	{
		id: "rule-005",
		category: "comments",
		name: "function-implementation",
		rule: "Never add comments describing WHAT code does; the code itself shows that",
	},
	{
		id: "rule-006",
		category: "comments",
		name: "legitimate-why-comment",
		rule: "Only add comments explaining WHY when the reason isn't obvious from context",
	},
	{
		id: "rule-007",
		category: "comments",
		name: "naming-over-commenting",
		rule: "Never add comments that could be replaced by better variable or function names",
	},
	{
		id: "rule-008",
		category: "comments",
		name: "todo-comments",
		rule: "Never add TODO comments without actionable context; either fix it or remove it",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
