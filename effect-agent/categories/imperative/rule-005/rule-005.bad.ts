// Rule: Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach
// Example: Effectful iteration (bad example)
// @rule-id: rule-005
// @category: imperative
// @original-name: effectful-iteration

// Declare external data and functions for demonstration
declare const items: unknown[];
declare function processItem(item: unknown): Promise<unknown>;

// Wrap in an exported async function to avoid unused variable errors
export async function badEffectfulIteration(): Promise<unknown[]> {
	// ❌ Bad:
	const results: unknown[] = [];
	for (const item of items) {
		const result = await processItem(item);
		results.push(result);
	}
	return results;
}
