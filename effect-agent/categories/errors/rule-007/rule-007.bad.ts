// Rule: Never rethrow transformed errors; use Effect.mapError
// Example: Transform low-level to domain errors (bad example)
// @rule-id: rule-007
// @category: errors
// @original-name: map-error

// Declare external URL
declare const url: string;

// ❌ Bad:
export async function fetchData(): Promise<Response> {
	const result = await fetch(url).catch((e: Error) => {
		throw new Error(`API failed: ${e.message}`);
	});
	return result;
}
