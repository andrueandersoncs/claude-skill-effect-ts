// Rule: Never use try/catch with async; use Effect.tryPromise()
// Example: Wrapping async operation

import { Effect, Schema } from "effect"
import { FetchUserError, User, UserId } from "../_fixtures.js"

// ✅ Good: Effect.tryPromise with typed error
const fetchUser = (id: UserId) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(`/users/${id}`).then((r) => r.json()),
      catch: (e) => new FetchUserError({ userId: id, cause: e }),
    })
    return yield* Schema.decodeUnknown(User)(response)
  })

export { fetchUser }
