// Rule: Never write plain functions; use Effect.fn() or Effect.gen()
// Example: Simple data transformation (bad example)
// @rule-id: rule-005
// @category: code-style
// @original-name: effect-fn-transformation

interface Item {
	price: number;
	quantity: number;
}

// BAD: Plain function instead of Effect.fn()
export const calculateTotal = (items: Item[]): number =>
	items.reduce((sum, item) => sum + item.price * item.quantity, 0);
