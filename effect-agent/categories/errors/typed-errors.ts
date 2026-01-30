// Rule: Never use untyped errors; use Schema.TaggedError
// Example: Multiple error types

import { Effect, Schema } from "effect"
import {
  BadRequest,
  defaultUser,
  getUser,
  NotFoundError,
  UserId,
  ValidationError,
} from "../_fixtures.js"

declare const id: UserId

// ✅ Good: Schema.TaggedError with catchTag for specific handling
const program = getUser(id).pipe(
  Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser)),
  Effect.catchTag("ValidationError" as never, (e: ValidationError) =>
    Effect.fail(new BadRequest({ message: e.message }))
  )
)

export { program }
