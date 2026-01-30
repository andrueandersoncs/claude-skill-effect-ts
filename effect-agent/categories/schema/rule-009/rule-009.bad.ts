// Rule: Never use Data.TaggedError; use Schema.TaggedError
// Example: Error type definition (bad example)
// @rule-id: rule-009
// @category: schema
// @original-name: schema-tagged-error

import { Data } from "effect";

// ❌ Bad: Using Data.TaggedError instead of Schema.TaggedError
class UserNotFound extends Data.TaggedError("UserNotFound")<{
	userId: string;
}> {}

// Usage of bad error
export function findUserBad(_userId: string): never {
	throw new UserNotFound({ userId: _userId });
}

export { UserNotFound };
