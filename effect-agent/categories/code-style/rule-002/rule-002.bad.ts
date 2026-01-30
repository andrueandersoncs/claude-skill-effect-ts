// Rule: Never use 'as any'; fix the type or create a Schema
// Example: Working with dynamic data (bad example)
// @rule-id: rule-002
// @category: code-style
// @original-name: dynamic-data

// BAD: Using 'as any' to bypass type checking
export const processEvent = (event: unknown): unknown => {
	const typed = event as any;
	return typed.payload.data;
};
