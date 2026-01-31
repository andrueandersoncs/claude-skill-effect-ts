// Rule: Use Schema.Class for data structures
// Example: Various anti-patterns (bad example)
// @rule-id: rule-005
// @category: schema
// @original-name: schema-class

import { Schema } from "effect";

// ===== Bad Pattern 1: Using TypeScript type for data structure =====
type User = {
	id: string;
	name: string;
	email: string;
};

// ===== Bad Pattern 2: Using TypeScript interface for data structure =====
interface Order {
	orderId: string;
	items: string[];
	total: number;
}

// Using the bad types
export function createUserBad(id: string, name: string, email: string): User {
	return { id, name, email };
}

export function createOrderBad(
	orderId: string,
	items: string[],
	total: number,
): Order {
	return { orderId, items, total };
}

// ===== Bad Pattern 3: Using Schema.Struct for entity that needs methods =====
const OrderItem = Schema.Struct({
	name: Schema.String,
	price: Schema.Number,
	quantity: Schema.Number,
});

const OrderWithItems = Schema.Struct({
	items: Schema.Array(OrderItem),
	discount: Schema.Number,
});

type OrderWithItemsType = Schema.Schema.Type<typeof OrderWithItems>;

// Separate function instead of method - loses encapsulation
const getTotal = (order: OrderWithItemsType) =>
	order.items.reduce((sum, i) => sum + i.price, 0) * (1 - order.discount);

// ===== Bad Pattern 4: Constructing object literals directly =====
const user: User = {
	id: "user-123",
	name: "Alice",
	email: "alice@example.com",
};

// ===== Bad Pattern 5: Using satisfies with object literals =====
const order = {
	orderId: "order-456",
	items: ["item1", "item2"],
	total: 99.99,
} satisfies Order;

export { user, order, getTotal };
export type { User, Order };
