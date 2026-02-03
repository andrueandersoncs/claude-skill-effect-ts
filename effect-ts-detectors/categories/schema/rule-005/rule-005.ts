// Rule: Use Schema.Class for data structures
// Example: Proper Schema.Class usage patterns
// @rule-id: rule-005
// @category: schema
// @original-name: schema-class

import { Array, Schema } from "effect";
import { Email, OrderId, UserId } from "../../_fixtures.js";

// ===== Good Pattern 1: Schema.Class for data structures =====
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

// ===== Good Pattern 2: Schema.Class with methods (computed properties) =====
class OrderItem extends Schema.Class<OrderItem>("OrderItem")({
	id: Schema.String,
	price: Schema.Number,
	quantity: Schema.Number,
}) {}

class OrderWithItems extends Schema.Class<OrderWithItems>("OrderWithItems")({
	items: Schema.Array(OrderItem),
	discount: Schema.Number,
}) {
	// Methods are part of the class, maintaining encapsulation
	get subtotal() {
		return Array.reduce(this.items, 0, (sum, i) => sum + i.price * i.quantity);
	}
	get total() {
		return this.subtotal * (1 - this.discount);
	}
}

// ===== Good Pattern 3: Use Schema class constructors =====
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

const orderWithItems = new OrderWithItems({
	items: [
		new OrderItem({ id: "item-1", price: 25.0, quantity: 2 }),
		new OrderItem({ id: "item-2", price: 49.99, quantity: 1 }),
	],
	discount: 0.1,
});

// Access computed properties
const _total = orderWithItems.total; // Encapsulated method access

export { User, Order, OrderItem, OrderWithItems, user, order, orderWithItems };
