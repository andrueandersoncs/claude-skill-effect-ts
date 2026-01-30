// Rule: Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is
// Example: Multi-condition assignment with Schema-defined conditions

import { Function, Match, Schema } from "effect"

const Condition1Active = Schema.Struct({
  condition1: Schema.Literal(true),
  condition2: Schema.Boolean,
})

const Condition2Active = Schema.Struct({
  condition1: Schema.Literal(false),
  condition2: Schema.Literal(true),
})

declare const condition1: boolean
declare const condition2: boolean
declare const value1: string
declare const value2: string
declare const defaultValue: string

// ✅ Good: Match.when with Schema.is for conditional assignment
const result = Match.value({ condition1, condition2 }).pipe(
  Match.when(Schema.is(Condition1Active), Function.constant(value1)),
  Match.when(Schema.is(Condition2Active), Function.constant(value2)),
  Match.orElse(Function.constant(defaultValue))
)

export { result }
