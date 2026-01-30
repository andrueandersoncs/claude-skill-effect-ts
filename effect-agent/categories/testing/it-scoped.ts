// Rule: Never manage resources manually in tests; use it.scoped
// Example: Testing with acquireRelease resources

import { it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { acquireDbConnection } from "../_fixtures.js"

// ✅ Good: it.scoped handles resource management
it.scoped("should use database connection", () =>
  Effect.gen(function* () {
    const conn = yield* acquireDbConnection
    const result = yield* conn.query("SELECT 1")
    expect(result).toBeDefined()
  })
)

export {}
