// Rule: Never use Data.TaggedError; use Schema.TaggedError
// Example: Error type definition
// @rule-id: rule-009
// @category: schema
// @original-name: schema-tagged-error

import { Schema } from "effect";

// ✅ Good: Schema.TaggedError works with Schema.is(), catchTag, and Match.tag
class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
	userId: Schema.String,
}) {}

export { UserNotFound };
