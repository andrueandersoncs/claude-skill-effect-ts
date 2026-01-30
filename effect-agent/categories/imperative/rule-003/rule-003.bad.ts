// Rule: Never use manual batching for large sequences; use Stream
// Example: Chunked processing with concurrency (bad example)
// @rule-id: rule-003
// @category: imperative
// @original-name: chunked-processing

// Declare external data and functions for demonstration
declare const items: unknown[];
declare function processItem(item: unknown): Promise<unknown>;

// Wrap in an exported async function to avoid unused variable errors
export async function badChunkedProcessing(): Promise<void> {
	// ❌ Bad:
	// Manual batching
	const batchSize = 100;
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await Promise.all(batch.map(processItem));
	}
}
