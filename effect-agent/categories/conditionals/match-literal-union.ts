// Rule: Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is
// Example: Matching any of several values with Schema.Literal union

import { Function, Match, Schema } from "effect"

const Weekend = Schema.Literal("Saturday", "Sunday")

// ✅ Good: Match.when with Schema.is for literal union
const isWeekend = Match.type<string>().pipe(
  Match.when(Schema.is(Weekend), Function.constant(true)),
  Match.orElse(Function.constant(false))
)

export { isWeekend }
