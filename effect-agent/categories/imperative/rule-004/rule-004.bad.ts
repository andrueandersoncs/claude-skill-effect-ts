// Rule: Never use for...of/for...in; use Array module functions
// Example: Conditional accumulation (bad example)
// @rule-id: rule-004
// @category: imperative
// @original-name: conditional-accumulation

// Declare external data for demonstration
interface Order {
	status: string;
	amount: number;
}
declare const orders: Order[];

// Wrap in an exported function to avoid unused variable errors
export function badConditionalAccumulation(): number {
	// ❌ Bad:
	let total = 0;
	for (const order of orders) {
		if (order.status === "completed") {
			total += order.amount;
		}
	}
	return total;
}
