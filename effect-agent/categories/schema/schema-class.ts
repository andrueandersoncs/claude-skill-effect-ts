// Rule: Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass
// Example: Data structure definition

import { Schema } from "effect"
import { Email, OrderId, UserId } from "../_fixtures.js"

// ✅ Good: Schema.Class for data structures
class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Email,
}) {}

class Order extends Schema.Class<Order>("Order")({
  orderId: OrderId,
  items: Schema.Array(Schema.String),
  total: Schema.Number,
}) {}

export { User, Order }
