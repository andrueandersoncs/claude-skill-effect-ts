// Rule: Never use manual validation functions; use Schema filters
// Example: Validation constraints in schema
// @rule-id: rule-007
// @category: schema
// @original-name: schema-filters

import { Schema } from "effect";

// ✅ Good: Validation built into schema definition
const Email = Schema.String.pipe(
	Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
	Schema.annotations({ identifier: "Email" }),
);

const Age = Schema.Number.pipe(
	Schema.int(),
	Schema.between(0, 150),
	Schema.annotations({ identifier: "Age" }),
);

class User extends Schema.Class<User>("User")({
	email: Email,
	age: Age,
}) {}

export { User };
