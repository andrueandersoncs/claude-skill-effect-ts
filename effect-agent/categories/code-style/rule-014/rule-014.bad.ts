// Rule: Never use type casting (as); use Schema.decodeUnknown or type guards
// Example: Validating API response (bad example)
// @rule-id: rule-014
// @category: code-style
// @original-name: validate-api-response

interface User {
	id: string;
	name: string;
	email: string;
}

// BAD: Type casting without runtime validation
export const fetchUser = async (id: string): Promise<User> => {
	const response = await fetch(`/users/${id}`);
	const data = await response.json();
	return data as User; // Type casting - no runtime validation!
};
