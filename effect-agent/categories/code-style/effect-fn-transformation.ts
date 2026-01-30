// Rule: Never write plain functions; use Effect.fn() or Effect.gen()
// Example: Simple data transformation

import { Array, Effect } from "effect"
import { Item } from "../_fixtures.js"

// ✅ Good: Effect.fn for simple effectful functions
const calculateTotal = Effect.fn("calculateTotal")(
  (items: ReadonlyArray<Item>) =>
    Effect.succeed(
      Array.reduce(items, 0, (sum, item) => sum + item.price * item.quantity)
    )
)

export { calculateTotal }
