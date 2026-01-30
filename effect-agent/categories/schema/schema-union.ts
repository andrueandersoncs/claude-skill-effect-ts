// Rule: Never use TypeScript union types; use Schema.Union of TaggedClass
// Example: Union type definition

import { Schema } from "effect"

// ✅ Good: Schema.Literal for string literals
const Status = Schema.Literal("pending", "active", "completed")
type Status = typeof Status.Type

// ✅ Good: Schema.TaggedClass for complex unions
class Success extends Schema.TaggedClass<Success>()("Success", {
  value: Schema.Unknown,
}) {}

class Failure extends Schema.TaggedClass<Failure>()("Failure", {
  error: Schema.String,
}) {}

const Result = Schema.Union(Success, Failure)
type Result = typeof Result.Type

export { Status, Success, Failure, Result }
