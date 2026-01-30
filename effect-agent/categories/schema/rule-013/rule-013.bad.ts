// Rule: Never use optional properties for state; use tagged unions
// Example: Order status with optional fields (bad example)
// @rule-id: rule-013
// @category: schema
// @original-name: tagged-union-state

import { Schema } from "effect";

// ❌ Bad: Using optional properties for state-dependent fields
const Order = Schema.Struct({
	orderId: Schema.String,
	items: Schema.Array(Schema.String),
	trackingNumber: Schema.optional(Schema.String),
	shippedAt: Schema.optional(Schema.Date),
	deliveredAt: Schema.optional(Schema.Date),
});

type Order = Schema.Schema.Type<typeof Order>;

// Problems with this approach:
// - Can have deliveredAt without shippedAt
// - Can have trackingNumber without being shipped
// - No clear state transitions
export function getOrderStatus(order: Order): string {
	if (order.deliveredAt) return "delivered";
	if (order.shippedAt) return "shipped";
	return "pending";
}

export { Order };
