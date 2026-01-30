// Rule: Never use manual batching loops; use Effect.all with concurrency
// Example: Limited concurrency (bad example)
// @rule-id: rule-007
// @category: imperative
// @original-name: limited-concurrency

// Declare external data and functions for demonstration
declare const items: unknown[];
declare function processItem(item: unknown): Promise<unknown>;

// Wrap in an exported async function to avoid unused variable errors
export async function badLimitedConcurrency(): Promise<void> {
	// ❌ Bad:
	// Complex manual batching with Promise.all
	const batchSize = 5;
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await Promise.all(batch.map(processItem));
	}
}
