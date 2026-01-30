// Rule: Never use fail-fast Promise.all; use Effect.all with mode: "either"
// Example: Get Either results for each operation (bad example)
// @rule-id: rule-001
// @category: errors
// @original-name: all-either-mode

// Declare external function and types
declare function processItem(item: string): Promise<string>;

// ❌ Bad:
export async function processItems(items: string[]): Promise<string[]> {
	const results = await Promise.all(items.map(processItem)); // Fails on first error
	return results;
}
