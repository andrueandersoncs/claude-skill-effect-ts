// Rule: Never use ._tag in array predicates; use Schema.is(Variant)
// Example: Partitioning by _tag

import { Array, Schema } from "effect"
import { OrderStatus, Pending } from "../_fixtures.js"

declare const orders: ReadonlyArray<OrderStatus>

// ✅ Good: Array.partition with Schema.is
const [notPending, pending] = Array.partition(orders, Schema.is(Pending))

export { notPending, pending }
