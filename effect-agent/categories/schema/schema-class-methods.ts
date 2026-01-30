// Rule: Never use Schema.Struct for entities with methods; use Schema.Class
// Example: Entity with computed properties

import { Array, Schema } from "effect";

class OrderItem extends Schema.Class<OrderItem>("OrderItem")({
	id: Schema.String,
	price: Schema.Number,
}) {}

// ✅ Good: Schema.Class with computed properties
class Order extends Schema.Class<Order>("Order")({
	items: Schema.Array(OrderItem),
	discount: Schema.Number,
}) {
	get subtotal() {
		return Array.reduce(this.items, 0, (sum, i) => sum + i.price);
	}
	get total() {
		return this.subtotal * (1 - this.discount);
	}
}

export { Order };
