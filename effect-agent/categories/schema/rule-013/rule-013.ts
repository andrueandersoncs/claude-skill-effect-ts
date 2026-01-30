// Rule: Never use optional properties for state; use tagged unions
// Example: Order status with optional fields
// @rule-id: rule-013
// @category: schema
// @original-name: tagged-union-state

import { Schema } from "effect";
import { OrderId, TrackingNumber } from "../_fixtures.js";

// ✅ Good: Tagged unions for state variants
class Pending extends Schema.TaggedClass<Pending>()("Pending", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
}) {}

class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
	trackingNumber: TrackingNumber,
	shippedAt: Schema.Date,
}) {}

class Delivered extends Schema.TaggedClass<Delivered>()("Delivered", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
	deliveredAt: Schema.Date,
}) {}

const Order = Schema.Union(Pending, Shipped, Delivered);
type Order = Schema.Schema.Type<typeof Order>;

export { Pending, Shipped, Delivered, Order };
