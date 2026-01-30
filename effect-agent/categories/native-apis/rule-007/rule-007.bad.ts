// Rule: Never use () => value; use Function.constant
// Example: Function that always returns same value (bad example)
// @rule-id: rule-007
// @category: native-apis
// @original-name: function-constant-value

// Type declaration
interface User {
	name: string;
}

// Declare external variables
declare const defaultUser: User;

// Bad: Arrow functions that return constant values instead of Function.constant
export const getDefaultUser = () => defaultUser;
export const alwaysZero = () => 0;
export const noop = () => undefined;
