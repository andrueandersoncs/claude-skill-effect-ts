// Rule: Never suppress type errors with comments; fix the types
// Example: Type mismatch error (bad example)
// @rule-id: rule-009
// @category: code-style
// @original-name: fix-types

// This rule detects @ts-ignore/@ts-expect-error for GENERAL type errors
// (not exhaustiveness-related, which is handled by rule-007)

interface User {
	id: string;
	name: string;
	email: string;
}

declare const data: unknown;
declare const processUser: (user: User) => void;
declare const getUserName: (user: User) => string;

// BAD: @ts-expect-error to suppress type mismatch (unknown -> User)
// @ts-expect-error - TODO fix types later
export const result1 = processUser(data);

// BAD: @ts-ignore to suppress argument type error
// @ts-ignore
export const result2 = getUserName({ id: 123, name: "test" });

// BAD: @ts-expect-error to suppress property access on unknown
// @ts-expect-error
export const result3 = data.nonExistentProperty;
