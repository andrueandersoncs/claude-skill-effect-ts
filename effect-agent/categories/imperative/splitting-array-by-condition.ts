// Rule: Never filter twice with opposite conditions; use Array.partition
// Example: Splitting array by condition

import { Array } from "effect";

interface User {
	age: number;
}

declare const users: ReadonlyArray<User>;

// ✅ Good: Array.partition for splitting by condition
const [minors, adults] = Array.partition(users, (u) => u.age >= 18);

export { minors, adults };
