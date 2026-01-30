// Rule: Never use record[key]; use Record.get (returns Option)
// Example: Safe property access (bad example)
// @rule-id: rule-013
// @category: native-apis
// @original-name: safe-property-access

// Declare external functions/variables
declare const prices: Record<string, number>;
declare const itemId: string;
declare function calculateTotal(price: number): void;

// Bad: Direct record access with undefined check instead of Record.get with Option
export function processPrice(): void {
	const price = prices[itemId];
	if (price !== undefined) {
		calculateTotal(price);
	}
}
