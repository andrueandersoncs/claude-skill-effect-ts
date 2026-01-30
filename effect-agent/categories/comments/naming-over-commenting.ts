// Rule: Never add comments that could be replaced by better variable or function names
// Example: Naming over commenting

import { Array } from "effect";

interface User {
	role: string;
}

declare const users: ReadonlyArray<User>;

// ❌ Bad: Comment compensates for poor naming
// Users who have admin privileges
const u = users.filter((x) => x.role === "admin");

// ✅ Good: Clear variable names make comments unnecessary
const adminUsers = Array.filter(users, (user) => user.role === "admin");

export { u, adminUsers };
