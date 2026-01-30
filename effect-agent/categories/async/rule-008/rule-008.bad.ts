// Rule: Never use async functions; use Effect.gen with yield*
// Example: Wrapping external async library (bad example)
// @rule-id: rule-008
// @category: async
// @original-name: wrap-external-async

// Mock external library
declare const externalLib: {
	doSomething: () => Promise<string>;
};

// ❌ Bad: Using async/await instead of Effect.gen with yield*
const useLibraryBad = async () => {
	const result = await externalLib.doSomething();
	return result;
};

export { useLibraryBad };
