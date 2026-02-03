/**
 * schema rules index
 *
 * This file exports all rules in the schema category.
 * Uses named exports to avoid duplicate export conflicts.
 */

// rule-001: branded-ids
export { getOrder, User as Rule001User } from "./rule-001/rule-001.js";

// rule-002: no-plain-error
export { UserNotFound as Rule002UserNotFound } from "./rule-002/rule-002.js";

// rule-003: parse-json
export * from "./rule-003/rule-003.js";

// rule-005: schema-class (comprehensive - includes methods and constructors)
export {
	Order as Rule005Order,
	OrderItem as Rule005OrderItem,
	OrderWithItems as Rule005OrderWithItems,
	order,
	orderWithItems,
	User as Rule005User,
	user,
} from "./rule-005/rule-005.js";

// rule-007: schema-filters
export { User as Rule007User } from "./rule-007/rule-007.js";

// rule-008: schema-literal
export {
	Status as Rule008Status,
	StatusFromEnum,
} from "./rule-008/rule-008.js";

// rule-009: schema-tagged-error
export { UserNotFound as Rule009UserNotFound } from "./rule-009/rule-009.js";

// rule-010: schema-transform
export { Dollars, price } from "./rule-010/rule-010.js";

// rule-011: schema-union
export {
	Failure,
	Result,
	Status as Rule011Status,
	Success,
} from "./rule-011/rule-011.js";

// rule-012: schema-unknown-legitimate
export { AppError, UserCreated } from "./rule-012/rule-012.js";

// rule-013: tagged-union-state
export {
	Delivered,
	Order as Rule013Order,
	Pending,
	Shipped,
} from "./rule-013/rule-013.js";

// rule-014: schema-field-composition
export {
	AdminUser,
	Customer as Rule014Customer,
	Employee as Rule014Employee,
	GuestUser,
	Person as Rule014Person,
	User as Rule014User,
	Violation as Rule014Violation,
	ViolationWithoutSuggestion,
	ViolationWithSuggestion,
} from "./rule-014/rule-014.js";

// rule-015: schema-class-over-struct
export {
	Order as Rule015Order,
	OrderStatus as Rule015OrderStatus,
	order as rule015Order,
	Pending as Rule015Pending,
	Shipped as Rule015Shipped,
	User as Rule015User,
	user as rule015User,
} from "./rule-015/rule-015.js";

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
		id: "rule-005",
		category: "schema",
		name: "schema-class",
		rule: "Use Schema.Class for data structures: prefer over types/interfaces, include methods, and use constructors",
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
	{
		id: "rule-014",
		category: "schema",
		name: "schema-field-composition",
		rule: "Never duplicate Schema fields across multiple definitions; use `.fields` spread, `.extend()`, `.pick()`, `.omit()`, or TaggedClass",
	},
	{
		id: "rule-015",
		category: "schema",
		name: "schema-class-over-struct",
		rule: "Always use Schema.Class for named/exported schemas; Schema.Struct is only acceptable for inline anonymous schemas",
	},
] as const;

export type RuleId = (typeof rules)[number]["id"];
