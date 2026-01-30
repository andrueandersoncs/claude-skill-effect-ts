// Rule: Never manually group with loops; use Array.groupBy
// Example: Grouping items by key (bad example)
// @rule-id: rule-008
// @category: native-apis
// @original-name: grouping-items-by-key

// Type declaration
interface User {
	role: string;
	name: string;
}

// Declare external variables
declare const users: User[];

// Bad: Manual grouping with for loop instead of Array.groupBy
export const usersByRole: Record<string, User[]> = {};
for (const user of users) {
	if (!usersByRole[user.role]) {
		usersByRole[user.role] = [];
	}
	usersByRole[user.role].push(user);
}
