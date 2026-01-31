// Rule: Use Effect's Array module for all array operations
// This file demonstrates all the anti-patterns that should be avoided
// @rule-id: rule-001-array-operations
// @category: native-apis
// @original-name: array-operations-consolidated

// Type declarations
interface User {
	email: string;
	role: string;
	age: number;
	name: string;
}

interface Item {
	id: string;
}

// Declare external functions/variables
declare const users: User[];
declare const items: Item[];
declare const ids: string[];
declare const arr: number[];
declare const targetId: string;
declare const defaultItem: Item;
declare const newItem: string;
declare function isValidEmail(email: string): boolean;

// -------------------------------------------------------------------------
// Bad Example 1: filter().map() chain instead of Array.filterMap
// -------------------------------------------------------------------------
export const validEmails = users
	.filter((u) => isValidEmail(u.email))
	.map((u) => u.email);

// -------------------------------------------------------------------------
// Bad Example 2: Using .find() with nullish coalescing instead of Array.findFirst
// -------------------------------------------------------------------------
export const found = items.find((i) => i.id === targetId) ?? defaultItem;

// -------------------------------------------------------------------------
// Bad Example 3: Manual grouping with for loop instead of Array.groupBy
// -------------------------------------------------------------------------
export const usersByRole: Record<string, User[]> = {};
for (const user of users) {
	if (!usersByRole[user.role]) {
		usersByRole[user.role] = [];
	}
	usersByRole[user.role].push(user);
}

// -------------------------------------------------------------------------
// Bad Example 4: Direct array index access instead of Array.head/Array.last
// -------------------------------------------------------------------------
export const first = arr[0];
export const last = arr[arr.length - 1];

// -------------------------------------------------------------------------
// Bad Example 5: Using Set spread to remove duplicates instead of Array.dedupe
// -------------------------------------------------------------------------
export const uniqueIds = [...new Set(ids)];

// -------------------------------------------------------------------------
// Bad Example 6: Using mutating array methods instead of immutable Effect operations
// -------------------------------------------------------------------------
export function badArraySplice(): string[] {
	const mutableArr = [...items.map((i) => i.id)];
	mutableArr.splice(2, 1); // Remove at index 2
	mutableArr.splice(1, 0, newItem); // Insert at index 1
	mutableArr.push("new-item"); // Mutate
	return mutableArr;
}

// -------------------------------------------------------------------------
// Bad Example 7: Filtering twice with opposite conditions instead of Array.partition
// -------------------------------------------------------------------------
export function badArraySplitting(): { minors: User[]; adults: User[] } {
	const minors = users.filter((u) => u.age < 18);
	const adults = users.filter((u) => u.age >= 18);
	return { minors, adults };
}

// -------------------------------------------------------------------------
// Bad Example 8: Using .length checks instead of Array.isEmptyArray
// -------------------------------------------------------------------------
export const isEmpty = arr.length === 0;
export const hasItems = arr.length > 0;

// -------------------------------------------------------------------------
// Bad Example 9: Using findIndex instead of Array.findFirstIndex
// -------------------------------------------------------------------------
export const index = items.findIndex((i) => i.id === targetId);

// -------------------------------------------------------------------------
// Bad Example 10: Using includes instead of Array.contains
// -------------------------------------------------------------------------
export const hasId = ids.includes(targetId);
