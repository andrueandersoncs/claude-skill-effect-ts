// Rule: Never use fast-check .filter(); use Schema constraints
// Example: Complex Schema constraints
// @rule-id: rule-014
// @category: testing
// @original-name: schema-constraints

import { Arbitrary, Schema } from "effect";

const UserId = Schema.String.pipe(Schema.minLength(1), Schema.brand("UserId"));
const Email = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/));
const Age = Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(18));

// ✅ Good: Schema with built-in constraints for Arbitrary generation
class User extends Schema.Class<User>("User")({
	id: UserId,
	name: Schema.NonEmptyString,
	age: Age,
	email: Email,
}) {}

const UserArbitrary = Arbitrary.make(User);

export { UserArbitrary };
