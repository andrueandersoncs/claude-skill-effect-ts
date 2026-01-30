// Rule: Never use Schema.Struct for entities with methods; use Schema.Class
// Example: Entity with computed properties (bad example)
// @rule-id: rule-004
// @category: schema
// @original-name: schema-class-methods

import { Schema } from "effect";

// Define OrderItem schema
const OrderItem = Schema.Struct({
	name: Schema.String,
	price: Schema.Number,
	quantity: Schema.Number,
});

// ❌ Bad: Using Schema.Struct for entity that needs computed properties
const Order = Schema.Struct({
	items: Schema.Array(OrderItem),
	discount: Schema.Number,
});

type Order = Schema.Schema.Type<typeof Order>;

// Separate function instead of method - loses encapsulation
const getTotal = (order: Order) =>
	order.items.reduce((sum, i) => sum + i.price, 0) * (1 - order.discount);

export { Order, OrderItem, getTotal };
