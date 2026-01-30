// Rule: Never use ! (non-null assertion); use Option or Effect
// Example: Asserting non-null value

import { Array, Effect, Option, pipe } from "effect"
import { User, UserNotFound } from "../_fixtures.js"

declare const users: ReadonlyArray<User>
declare const id: string

// ✅ Good: Option with proper error handling
const user = pipe(
  Array.findFirst(users, (u) => u.id === id),
  Option.match({
    onNone: () => Effect.fail(new UserNotFound({ userId: id as any })),
    onSome: Effect.succeed,
  })
)

export { user }
