// Rule: Never construct object literals; use Schema class constructors
// Example: Creating data instances
// @rule-id: rule-006
// @category: schema
// @original-name: schema-constructor

import { Schema } from "effect";
import { Email, OrderId, UserId } from "../_fixtures.js";

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

// ✅ Good: Use Schema class constructors
const user = new User({
	id: UserId.make("user-123"),
	name: "Alice",
	email: Email.make("alice@example.com"),
});

const order = new Order({
	orderId: OrderId.make("order-456"),
	items: ["item1", "item2"],
	total: 99.99,
});

export { user, order };
