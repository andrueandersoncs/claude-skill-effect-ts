// Rule: Never add comments that could be replaced by better variable or function names
// Example: Naming over commenting (bad example)
// @rule-id: rule-007
// @category: comments
// @original-name: naming-over-commenting

interface User {
	role: string;
}

declare const users: ReadonlyArray<User>;

// ❌ Bad: Comment compensates for poor naming
// Users who have admin privileges
const u = users.filter((x) => x.role === "admin");

export { u };
