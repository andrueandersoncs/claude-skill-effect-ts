// Rule: Never use setTimeout for timeouts; use Effect.timeout
// Example: Timeout with typed error (bad example)
// @rule-id: rule-011
// @category: errors
// @original-name: timeout-fail

// ❌ Bad:
export const withTimeout = async <T>(
	promise: Promise<T>,
	ms: number,
): Promise<T> => {
	const timeout = new Promise<never>((_resolve, reject) =>
		setTimeout(() => reject(new Error("Timeout")), ms),
	);
	return Promise.race([promise, timeout]);
};
