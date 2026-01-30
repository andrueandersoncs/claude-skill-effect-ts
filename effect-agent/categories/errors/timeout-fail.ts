// Rule: Never use setTimeout for timeouts; use Effect.timeout
// Example: Timeout with typed error

import { Effect } from "effect"
import { fetchData, TimeoutError } from "../_fixtures.js"

// ✅ Good: Effect.timeoutFail with typed error
const result = Effect.gen(function* () {
  return yield* fetchData().pipe(
    Effect.timeoutFail({
      duration: "5 seconds",
      onTimeout: () => new TimeoutError({ operation: "fetchData" }),
    })
  )
})

export { result }
