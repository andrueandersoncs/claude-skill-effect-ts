// Rule: Never use try/catch with async; use Effect.tryPromise()
// Example: Wrapping async operation (bad example)
// @rule-id: rule-005
// @category: errors
// @original-name: effect-try-promise

// Declare types
interface User {
	id: string;
	name: string;
}

// ❌ Bad:
export async function fetchUser(id: string): Promise<User> {
	try {
		const response = await fetch(`/users/${id}`);
		return (await response.json()) as User;
	} catch (_e) {
		throw new Error("Failed to fetch user");
	}
}
