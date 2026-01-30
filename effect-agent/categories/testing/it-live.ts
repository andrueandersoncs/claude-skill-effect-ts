// Rule: Never use it.effect when you need real time; use it.live
// Example: Testing with real clock/environment

import { it, expect } from "@effect/vitest"
import { Effect } from "effect"

// ✅ Good: it.live uses real clock, logger, etc.
it.live("should measure real time", () =>
  Effect.gen(function* () {
    const start = Date.now()
    yield* Effect.sleep("10 millis") // Real 10ms delay
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(10) // Passes
  })
)

export {}
