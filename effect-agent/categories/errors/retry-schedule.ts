// Rule: Never use manual retry loops; use Effect.retry with Schedule
// Example: Retry only for specific errors

import { Effect, Function, Match, Schedule, Schema } from "effect"
import { Item, NetworkError } from "../_fixtures.js"

// Declare a function that can fail with NetworkError
declare const fetchDataWithError: () => Effect.Effect<
  { items: ReadonlyArray<Item> },
  NetworkError
>

// ✅ Good: Effect.retry with Schedule and conditional
const result = Effect.gen(function* () {
  return yield* fetchDataWithError().pipe(
    Effect.retry({
      schedule: Schedule.recurs(3),
      while: (error) =>
        Match.value(error).pipe(
          Match.when(Schema.is(NetworkError), Function.constant(true)),
          Match.orElse(Function.constant(false))
        ),
    })
  )
})

export { result }
