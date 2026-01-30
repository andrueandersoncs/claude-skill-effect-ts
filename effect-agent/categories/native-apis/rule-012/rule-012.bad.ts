// Rule: Never use nested function calls; use flow for composing pipelines
// Example: Building reusable transformation pipeline (bad example)
// @rule-id: rule-012
// @category: native-apis
// @original-name: reusable-pipeline

// Type declarations
interface User {
	active: boolean;
	email: string;
}

interface Order {
	active: boolean;
	total: number;
}

// Bad: Repeated inline logic instead of using flow to compose reusable pipelines
export const processUsers = (users: Array<User>) =>
	users.filter((u) => u.active).map((u) => u.email);

export const processOrders = (orders: Array<Order>) =>
	orders.filter((o) => o.active).map((o) => o.total);
