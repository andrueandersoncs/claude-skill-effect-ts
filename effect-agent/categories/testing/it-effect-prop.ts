// Rule: Never use hard-coded test data; use it.effect.prop with Schema
// Example: Multiple test inputs

import { it, expect } from "@effect/vitest"
import { Effect } from "effect"
import { Order, processOrder } from "../_fixtures.js"

// ✅ Good: it.effect.prop generates test data from Schema
it.effect.prop(
  "should process all valid orders",
  { order: Order }, // Schema as arbitrary source
  ({ order }) =>
    Effect.gen(function* () {
      const result = yield* processOrder(order)
      expect(result).toBeDefined()
    })
)

export {}
