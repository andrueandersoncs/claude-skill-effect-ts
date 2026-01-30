// Rule: Never use throw statements; use Effect.fail()
// Example: Conditional throw based on state

import { Effect, Match, Schema } from "effect"
import { InvalidTotal, OrderCancelled, Order, processValidOrder } from "../_fixtures.js"

// ✅ Good: Match with Effect.fail for typed errors
const processOrder = (order: Order) =>
  Match.value(order).pipe(
    Match.when({ status: "cancelled" }, (o) =>
      Effect.fail(new OrderCancelled({ orderId: o.id }))
    ),
    Match.when({ total: (t: number) => t <= 0 }, (o) =>
      Effect.fail(new InvalidTotal({ total: o.total }))
    ),
    Match.orElse((o) => processValidOrder(o))
  )

export { processOrder }
