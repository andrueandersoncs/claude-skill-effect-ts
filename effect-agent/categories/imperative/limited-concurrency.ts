// Rule: Never use manual batching loops; use Effect.all with concurrency
// Example: Limited concurrency

import { Array, Effect } from "effect"
import { processItem } from "../_fixtures.js"

declare const items: ReadonlyArray<string>

// ✅ Good: Effect.all with concurrency option
const goodExample = Effect.gen(function* () {
  const results = yield* Effect.all(Array.map(items, processItem), {
    concurrency: 5,
  })
  return results
})

export { goodExample }
