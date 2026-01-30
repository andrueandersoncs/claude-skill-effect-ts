// Rule: Never use manual validation functions; use Schema filters
// Example: Validation constraints in schema (bad example)
// @rule-id: rule-007
// @category: schema
// @original-name: schema-filters

// ❌ Bad: Manual validation functions that throw
const validateEmail = (s: string): string => {
	if (!s.includes("@")) throw new Error("Invalid email");
	return s;
};

const validateAge = (n: number): number => {
	if (n < 0 || n > 150) throw new Error("Invalid age");
	return n;
};

// Usage of bad validation
export function createPersonBad(email: string, age: number) {
	return {
		email: validateEmail(email),
		age: validateAge(age),
	};
}

export { validateEmail, validateAge };
