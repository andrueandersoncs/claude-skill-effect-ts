// Rule: Never use throw statements; use Effect.fail()
// Example: Conditional throw based on state (bad example)
// @rule-id: rule-004
// @category: errors
// @original-name: conditional-fail

// Declare types and external functions
interface Order {
	status: string;
	total: number;
}

declare function processValidOrder(order: Order): Order;

// ❌ Bad:
export function processOrder(order: Order): Order {
	if (order.status === "cancelled") {
		throw new Error("Cannot process cancelled order");
	}
	if (order.total <= 0) {
		throw new Error("Order total must be positive");
	}
	return processValidOrder(order);
}
