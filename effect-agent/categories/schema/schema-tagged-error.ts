// Rule: Never use Data.TaggedError; use Schema.TaggedError
// Example: Error type definition

import { Schema } from "effect"

// ✅ Good: Schema.TaggedError works with Schema.is(), catchTag, and Match.tag
class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
  userId: Schema.String,
}) {}

export { UserNotFound }
