// Rule: Never reassign variables; use functional transformation
// Example: Building object with mutation (bad example)
// @rule-id: rule-002
// @category: imperative
// @original-name: building-object-mutation

// Declare external data for demonstration
interface Item {
	key: string;
	value: number;
}
declare const items: Item[];

// Wrap in an exported function to avoid unused variable errors
export function badObjectBuilding(): Record<string, number> {
	// ❌ Bad:
	const obj: Record<string, number> = {};
	for (const item of items) {
		obj[item.key] = item.value;
	}
	return obj;
}
