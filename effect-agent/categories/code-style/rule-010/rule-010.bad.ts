// Rule: Never use ! (non-null assertion); use Option or Effect
// Example: Asserting non-null value (bad example)
// @rule-id: rule-010
// @category: code-style
// @original-name: non-null-assertion

interface User {
	id: string;
	name: string;
}

declare const users: User[];
declare const id: string;

// BAD: Non-null assertion operator
export const getUser = (): string => {
	const user = users.find((u) => u.id === id)!;
	const name = user.name;
	return name;
};
