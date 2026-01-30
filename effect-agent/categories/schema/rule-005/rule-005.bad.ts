// Rule: Never use TypeScript type or interface for data structures; use Schema.Class or Schema.TaggedClass
// Example: Data structure definition (bad example)
// @rule-id: rule-005
// @category: schema
// @original-name: schema-class

// ❌ Bad: Using TypeScript type for data structure
type User = {
	id: string;
	name: string;
	email: string;
};

// ❌ Bad: Using TypeScript interface for data structure
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

export type { User, Order };
