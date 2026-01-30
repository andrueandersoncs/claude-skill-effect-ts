// Rule: Never construct object literals; use Schema class constructors
// Example: Creating data instances (bad example)
// @rule-id: rule-006
// @category: schema
// @original-name: schema-constructor

// Define types for demonstration
type User = {
	id: string;
	name: string;
	email: string;
};

interface Order {
	orderId: string;
	items: string[];
	total: number;
}

// ❌ Bad: Constructing object literals directly
const user: User = {
	id: "user-123",
	name: "Alice",
	email: "alice@example.com",
};

// ❌ Bad: Using satisfies with object literals
const order = {
	orderId: "order-456",
	items: ["item1", "item2"],
	total: 99.99,
} satisfies Order;

export { user, order };
export type { User, Order };
