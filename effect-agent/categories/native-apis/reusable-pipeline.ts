// Rule: Never use nested function calls; use flow for composing pipelines
// Example: Building reusable transformation pipeline

import { Array, pipe } from "effect"
import { Order, User } from "../_fixtures.js"

declare const users: ReadonlyArray<User>
declare const orders: ReadonlyArray<Order>

// ✅ Good: Reusable pipelines with pipe
const getActiveEmails = (users: ReadonlyArray<User>) =>
  pipe(
    users,
    Array.filter((u) => u.active === true),
    Array.map((u) => u.email)
  )

const getActiveTotals = (orders: ReadonlyArray<Order>) =>
  pipe(
    orders,
    Array.filter((o) => o.status === "completed"),
    Array.map((o) => o.total)
  )

// Apply the composed pipelines
const emails = getActiveEmails(users)
const totals = getActiveTotals(orders)

export { emails, totals }
