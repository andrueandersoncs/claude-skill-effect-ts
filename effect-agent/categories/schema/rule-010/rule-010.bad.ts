// Rule: Never use manual type conversions; use Schema.transform
// Example: Domain transformation (cents to dollars) (bad example)
// @rule-id: rule-010
// @category: schema
// @original-name: schema-transform

// ❌ Bad: Manual conversion functions without schema integration
interface Price {
	cents: number;
}

const toDollars = (p: Price): number => p.cents / 100;
const toCents = (dollars: number): number => Math.round(dollars * 100);

// Usage of bad conversion
export function formatPrice(price: Price): string {
	return `$${toDollars(price).toFixed(2)}`;
}

export function createPrice(dollars: number): Price {
	return { cents: toCents(dollars) };
}

export { toDollars, toCents };
export type { Price };
