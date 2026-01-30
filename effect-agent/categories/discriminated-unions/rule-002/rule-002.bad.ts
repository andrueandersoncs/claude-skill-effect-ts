// Rule: Never use ._tag in array predicates; use Schema.is(Variant)
// Example: Partitioning by _tag (bad example)
// @rule-id: rule-002
// @category: discriminated-unions
// @original-name: partitioning-by-tag

import type { OrderStatus } from "../../_fixtures.js";

// Declare an array of orders for the example
declare const orders: ReadonlyArray<OrderStatus>;

// ❌ Bad: Using ._tag in filter predicates
const pending = orders.filter((o) => o._tag === "Pending");
const notPending = orders.filter((o) => o._tag !== "Pending");

export { pending, notPending };
