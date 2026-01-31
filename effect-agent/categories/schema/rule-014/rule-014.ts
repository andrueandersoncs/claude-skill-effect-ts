// Rule: Never duplicate Schema fields across multiple definitions; use `.fields` spread, `.extend()`, `.pick()`, `.omit()`, or TaggedClass
// Example: Using schema composition to avoid field duplication
// @rule-id: rule-014
// @category: schema
// @original-name: schema-field-composition

import { Match, Schema } from "effect";

// ✅ Good: Define severity and certainty as reusable schemas
const Severity = Schema.Union(
	Schema.Literal("error"),
	Schema.Literal("warning"),
	Schema.Literal("info"),
);

const Certainty = Schema.Union(
	Schema.Literal("definite"),
	Schema.Literal("potential"),
);

// ✅ Good: Define base fields once
const violationBaseFields = {
	ruleId: Schema.String,
	category: Schema.String,
	message: Schema.String,
	filePath: Schema.String,
	line: Schema.Number,
	column: Schema.Number,
	snippet: Schema.String,
	severity: Severity,
	certainty: Certainty,
};

// ✅ Good: Use TaggedClass with shared fields for discriminated union
class ViolationWithSuggestion extends Schema.TaggedClass<ViolationWithSuggestion>()(
	"ViolationWithSuggestion",
	{
		...violationBaseFields,
		suggestion: Schema.String,
	},
) {}

class ViolationWithoutSuggestion extends Schema.TaggedClass<ViolationWithoutSuggestion>()(
	"ViolationWithoutSuggestion",
	violationBaseFields,
) {}

// ✅ Good: Union type for pattern matching
const Violation = Schema.Union(
	ViolationWithSuggestion,
	ViolationWithoutSuggestion,
);
type Violation = typeof Violation.Type;

// ✅ Good: Pattern match on _tag for exhaustive handling
const formatViolation = (v: Violation) =>
	Match.value(v).pipe(
		Match.tag(
			"ViolationWithSuggestion",
			(v) => `${v.message}\n  💡 ${v.suggestion}`,
		),
		Match.tag("ViolationWithoutSuggestion", (v) => v.message),
		Match.exhaustive,
	);

// ✅ Good: Schema.Class with .extend() for inheritance
class Person extends Schema.Class<Person>("Person")({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
}) {}

class Employee extends Person.extend<Employee>("Employee")({
	department: Schema.String,
}) {}

class Customer extends Person.extend<Customer>("Customer")({
	loyaltyPoints: Schema.Number,
}) {}

// ✅ Good: Using .fields spread for struct composition
const PersonStruct = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
});

const EmployeeStruct = Schema.Struct({
	...PersonStruct.fields,
	department: Schema.String,
});

// ✅ Good: Using .pick() and .omit() for field selection
const FullUser = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	password: Schema.String,
	createdAt: Schema.Date,
});

const PublicUser = FullUser.omit("password");
const UserCredentials = FullUser.pick("email", "password");
const UserProfile = FullUser.omit("password", "createdAt");

// ✅ Good: Shared fields object for TaggedClass variants
const userBaseFields = {
	id: Schema.Number,
	name: Schema.String,
	email: Schema.String,
};

class AdminUser extends Schema.TaggedClass<AdminUser>()("AdminUser", {
	...userBaseFields,
	permissions: Schema.Array(Schema.String),
}) {}

class GuestUser extends Schema.TaggedClass<GuestUser>()("GuestUser", {
	...userBaseFields,
	expiresAt: Schema.Date,
}) {}

const User = Schema.Union(AdminUser, GuestUser);
type User = typeof User.Type;

// ✅ Good: Pattern match users by tag
const describeUser = (u: User) =>
	Match.value(u).pipe(
		Match.tag(
			"AdminUser",
			(u) => `Admin: ${u.name} (${u.permissions.length} perms)`,
		),
		Match.tag("GuestUser", (u) => `Guest: ${u.name} (expires: ${u.expiresAt})`),
		Match.exhaustive,
	);

export {
	Violation,
	ViolationWithSuggestion,
	ViolationWithoutSuggestion,
	formatViolation,
	Person,
	Employee,
	Customer,
	PersonStruct,
	EmployeeStruct,
	FullUser,
	PublicUser,
	UserCredentials,
	UserProfile,
	User,
	AdminUser,
	GuestUser,
	describeUser,
};
