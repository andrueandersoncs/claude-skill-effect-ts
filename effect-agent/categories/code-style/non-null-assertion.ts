// Rule: Never use ! (non-null assertion); use Option or Effect
// Example: Asserting non-null value

import { Array, Effect, Option, pipe, Schema } from "effect"
import { User, UserId, UserNotFound } from "../_fixtures.js"

declare const users: ReadonlyArray<User>
declare const id: UserId

// ✅ Good: Option with proper error handling
const user = pipe(
  Array.findFirst(users, (u) => u.id === id),
  Option.match({
    onNone: () => Effect.fail(new UserNotFound({ userId: id })),
    onSome: Effect.succeed,
  })
)

export { user }
