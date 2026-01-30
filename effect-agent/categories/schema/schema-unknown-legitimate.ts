// Rule: Never use Schema.Any/Schema.Unknown unless genuinely unconstrained
// Example: Legitimate use of Schema.Unknown (exception cause)

import { Schema } from "effect"
import { Email, UserId } from "../_fixtures.js"

// ✅ Good: Schema.Unknown only for genuinely unconstrained values (like error causes)
class AppError extends Schema.TaggedError<AppError>()("AppError", {
  message: Schema.String,
  cause: Schema.Unknown, // Exception causes are legitimately unknown
}) {}

// ✅ Good: Typed schema for domain events
class UserCreated extends Schema.TaggedClass<UserCreated>()("UserCreated", {
  userId: UserId,
  email: Email,
}) {}

export { AppError, UserCreated }
