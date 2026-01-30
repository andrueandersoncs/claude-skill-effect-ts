// Rule: Never duplicate Schema fields across multiple definitions; use `.fields` spread, `.extend()`, `.pick()`, `.omit()`, or TaggedClass
// Example: Duplicated schema fields (bad example)
// @rule-id: rule-014
// @category: schema
// @original-name: schema-field-composition

import { Schema } from "effect";

// ❌ Bad: Duplicated Schema.Struct fields
const ViolationSchema = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
	suggestion: Schema.optional(Schema.String),
});

// Same fields duplicated - should use ViolationSchema.fields spread
const ValidViolationWithSuggestion = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
	suggestion: Schema.String,
});

// Same fields duplicated again
const ValidViolationWithoutSuggestion = Schema.Struct({
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Schema.Union(
		Schema.Literal("error"),
		Schema.Literal("warning"),
		Schema.Literal("info"),
	),
	certainty: Schema.Union(
		Schema.Literal("definite"),
		Schema.Literal("potential"),
	),
});

// ❌ Bad: Duplicated Schema.Class fields
class Person extends Schema.Class<Person>("Person")({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
}) {}

// Should use Person.extend() instead
class Employee extends Schema.Class<Employee>("Employee")({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	department: Schema.String,
}) {}

// Should use Person.extend() instead
class Customer extends Schema.Class<Customer>("Customer")({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	loyaltyPoints: Schema.Number,
}) {}

// ❌ Bad: Duplicated TaggedClass fields without shared base
class AdminUser extends Schema.TaggedClass<AdminUser>()("AdminUser", {
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	permissions: Schema.Array(Schema.String),
}) {}

class GuestUser extends Schema.TaggedClass<GuestUser>()("GuestUser", {
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	expiresAt: Schema.Date,
}) {}

export {
	ViolationSchema,
	ValidViolationWithSuggestion,
	ValidViolationWithoutSuggestion,
	Person,
	Employee,
	Customer,
	AdminUser,
	GuestUser,
};
