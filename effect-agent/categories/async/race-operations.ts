// Rule: Never use Promise.race; use Effect.race or Effect.raceAll
// Example: Racing multiple operations

import { Effect } from "effect"
import { fetchFromBackup, fetchFromPrimary } from "../_fixtures.js"

// ✅ Good: Effect.race for racing two operations
const result = Effect.gen(function* () {
  return yield* Effect.race(fetchFromPrimary(), fetchFromBackup())
})

export { result }
