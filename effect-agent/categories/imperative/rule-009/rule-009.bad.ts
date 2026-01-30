// Rule: Never filter twice with opposite conditions; use Array.partition
// Example: Splitting array by condition (bad example)
// @rule-id: rule-009
// @category: imperative
// @original-name: splitting-array-by-condition

// Declare external data for demonstration
interface User {
	age: number;
}
declare const users: User[];

// Wrap in an exported function to avoid unused variable errors
export function badArraySplitting(): { minors: User[]; adults: User[] } {
	// ❌ Bad:
	const minors = users.filter((u) => u.age < 18);
	const adults = users.filter((u) => u.age >= 18);
	return { minors, adults };
}
