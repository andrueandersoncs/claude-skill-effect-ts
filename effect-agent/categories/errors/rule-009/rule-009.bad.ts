// Rule: Never use manual retry loops; use Effect.retry with Schedule
// Example: Retry only for specific errors (bad example)
// @rule-id: rule-009
// @category: errors
// @original-name: retry-schedule

// Declare types and external functions
interface NetworkError extends Error {
	code: string;
}

declare function fetchData(): Promise<string>;

// ❌ Bad:
export async function fetchWithRetry(): Promise<string> {
	let attempts = 0;
	while (attempts < 3) {
		try {
			return await fetchData();
		} catch (e) {
			const error = e as NetworkError;
			if (error.code !== "NETWORK_ERROR") throw e;
			attempts++;
		}
	}
	throw new Error("Max retries exceeded");
}
