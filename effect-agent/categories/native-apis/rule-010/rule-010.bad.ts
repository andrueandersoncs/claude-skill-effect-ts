// Rule: Never use destructuring to omit fields; use Struct.omit
// Example: Omitting fields (bad example)
// @rule-id: rule-010
// @category: native-apis
// @original-name: omitting-fields

// Type declaration
interface User {
	name: string;
	email: string;
	password: string;
	ssn: string;
}

// Declare external variables
declare const user: User;

// Bad: Destructuring to omit fields instead of Struct.omit
export const { password, ssn, ...publicUser } = user;

// Export to avoid unused variable errors
export const _password = password;
export const _ssn = ssn;
