// Rule: Never mutate variables (let, push, pop, splice); use immutable operations
// Example: Array splice/modification (bad example)
// @rule-id: rule-001
// @category: imperative
// @original-name: array-splice-modification

// Declare external data for demonstration
declare const items: string[];
declare const newItem: string;

// Wrap in an exported function to avoid unused variable errors
export function badArraySplice(): string[] {
	// ❌ Bad:
	const arr = [...items];
	arr.splice(2, 1); // Remove at index 2
	arr.splice(1, 0, newItem); // Insert at index 1
	return arr;
}
