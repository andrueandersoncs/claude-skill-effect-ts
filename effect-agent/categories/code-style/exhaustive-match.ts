// Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
// Example: Switch exhaustiveness

import { Function, Match } from "effect"

type Status = "pending" | "active" | "completed"

// ✅ Good: Match.exhaustive for exhaustive handling
const handleStatus = Match.type<Status>().pipe(
  Match.when("pending", Function.constant("Waiting")),
  Match.when("active", Function.constant("Running")),
  Match.when("completed", Function.constant("Done")),
  Match.exhaustive
)

export { handleStatus }
