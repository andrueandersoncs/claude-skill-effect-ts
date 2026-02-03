// Rule: Always use Schema.Class for named/exported schemas
// Example: Proper Schema.Class usage patterns
// @rule-id: rule-015
// @category: schema
// @original-name: schema-class-over-struct

import { Schema } from "effect";

// ===== Good Pattern 1: Schema.Class for named data structures =====
class User extends Schema.Class<User>("User")({
	id: Schema.Number,
	name: Schema.String,
}) {
	get displayName() {
		return `User #${this.id}: ${this.name}`;
	}
}

// ===== Good Pattern 2: Schema.Class with methods =====
class Order extends Schema.Class<Order>("Order")({
	orderId: Schema.String,
	items: Schema.Array(Schema.String),
	discount: Schema.Number,
}) {
	get itemCount() {
		return this.items.length;
	}

	hasDiscount() {
		return this.discount > 0;
	}
}

// ===== Good Pattern 3: Schema.TaggedClass for discriminated unions =====
class Pending extends Schema.TaggedClass<Pending>()("Pending", {
	orderId: Schema.String,
}) {}

class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
	orderId: Schema.String,
	trackingNumber: Schema.String,
}) {}

const OrderStatus = Schema.Union(Pending, Shipped);

// ===== Good Pattern 4: Inline Schema.Struct (acceptable for anonymous use) =====
// These are acceptable because they're not assigned to named variables

// Inline in a function parameter type
const processData = (
	schema: Schema.Schema<{ readonly value: string }>,
): void => {
	// Implementation
	void schema;
};

// Inline struct passed directly (not assigned)
processData(Schema.Struct({ value: Schema.String }));

// ===== Good Pattern 5: Construction with new =====
const user = new User({ id: 1, name: "Alice" });
const order = new Order({ orderId: "123", items: ["item1"], discount: 0.1 });

export { Order, OrderStatus, Pending, Shipped, User, order, user };
