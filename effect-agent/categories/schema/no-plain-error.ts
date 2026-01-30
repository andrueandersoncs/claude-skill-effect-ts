// Rule: Never extend plain Error class; use Schema.TaggedError
// Example: Domain error types

import { Schema } from "effect";

// ✅ Good: Schema.TaggedError for domain errors
class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
	userId: Schema.String,
}) {}

export { UserNotFound };
