// Rule: Never use fast-check .filter(); use Schema constraints
// Example: Complex Schema constraints (bad example)
// @rule-id: rule-014
// @category: testing
// @original-name: schema-constraints

// BAD: Using fast-check with filter instead of Schema constraints
import * as fc from "fast-check";

// BAD: Using fast-check .filter() instead of Schema constraints
// This is inefficient - many generated values are discarded
export const validUser = fc
	.record({
		id: fc.string(),
		name: fc.string(),
		age: fc.integer(),
		email: fc.string(),
	})
	.filter((u) => u.name.length > 0 && u.age >= 18 && u.email.includes("@"));
