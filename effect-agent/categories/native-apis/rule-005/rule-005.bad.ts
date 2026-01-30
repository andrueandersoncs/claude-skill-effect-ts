// Rule: Never chain filter then map; use Array.filterMap in one pass
// Example: Filter and transform in single pass (bad example)
// @rule-id: rule-005
// @category: native-apis
// @original-name: filter-and-transform-single-pass

// Type declaration
interface User {
	email: string;
}

// Declare external functions/variables
declare const users: User[];
declare function isValidEmail(email: string): boolean;

// Bad: Separate filter and map instead of Array.filterMap
export const validEmails = users
	.filter((u) => isValidEmail(u.email))
	.map((u) => u.email);
