// Rule: Never use try/catch blocks; use Effect.try()
// Example: Multiple try/catch blocks (bad example)
// @rule-id: rule-006
// @category: errors
// @original-name: effect-try

// Declare types and external functions
interface Order {
	id: string;
	total: number;
}

declare function saveOrder(order: Order): Promise<void>;

// ❌ Bad:
export async function processOrder(data: string): Promise<void> {
	let order: Order;
	try {
		order = JSON.parse(data) as Order;
	} catch (_e) {
		throw new Error("Invalid order JSON");
	}

	try {
		await saveOrder(order);
	} catch (_e) {
		throw new Error("Failed to save order");
	}
}
