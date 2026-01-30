// Rule: Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is
// Example: Multi-condition object matching with Schema-defined predicates

import { Function, Match, Schema } from "effect"

interface Order {
  total: number
  isPremium: boolean
}

const HighValue = Schema.Struct({
  total: Schema.Number.pipe(Schema.greaterThan(1000)),
  isPremium: Schema.Boolean,
})

const HighValuePremium = Schema.Struct({
  total: Schema.Number.pipe(Schema.greaterThan(1000)),
  isPremium: Schema.Literal(true),
})

const Premium = Schema.Struct({
  total: Schema.Number,
  isPremium: Schema.Literal(true),
})

// ✅ Good: Match.when with Schema.is predicates
const calculateDiscount = (order: Order) =>
  Match.value(order).pipe(
    Match.when(Schema.is(HighValuePremium), Function.constant(0.25)),
    Match.when(Schema.is(HighValue), Function.constant(0.15)),
    Match.when(Schema.is(Premium), Function.constant(0.1)),
    Match.orElse(Function.constant(0))
  )

export { calculateDiscount }
