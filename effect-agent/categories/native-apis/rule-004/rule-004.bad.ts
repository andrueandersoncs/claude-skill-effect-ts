// Rule: Never use native method chaining; use pipe with Effect's Array module
// Example: Data transformation pipeline (bad example)
// @rule-id: rule-004
// @category: native-apis
// @original-name: data-transformation-pipeline

// Type declaration
interface User {
	active: boolean;
	email: string;
}

// Declare external variables
declare const users: User[];

// Bad: Method chaining (mixes native with Effect)
export const result = users
	.filter((u) => u.active)
	.map((u) => u.email)
	.slice(0, 10);
