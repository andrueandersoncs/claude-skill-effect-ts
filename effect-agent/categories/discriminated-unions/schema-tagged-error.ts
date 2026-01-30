// Rule: Never use Data.TaggedError; use Schema.TaggedError for full compatibility
// Example: Error handling with Schema.TaggedError

import { Effect, Match, Schema } from "effect"
import { defaultUser, getUser, UserId, UserNotFound } from "../_fixtures.js"

declare const id: UserId
declare const error: unknown

// ✅ Good: Schema.TaggedError works with Effect.catchTag
const withCatchTag = getUser(id).pipe(
  Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser))
)

// ✅ Good: Schema.is works with Schema.TaggedError inside Match
const withSchemaIs = Match.value(error).pipe(
  Match.when(Schema.is(UserNotFound), () => defaultUser),
  Match.orElse(() => Effect.die("Unknown error"))
)

// ✅ Good: Match.tag works with Schema.TaggedError
const handleError = (e: UserNotFound) =>
  Match.value(e).pipe(
    Match.tag("UserNotFound", () => Effect.succeed(defaultUser)),
    Match.exhaustive
  )

export { withCatchTag, withSchemaIs, handleError }
