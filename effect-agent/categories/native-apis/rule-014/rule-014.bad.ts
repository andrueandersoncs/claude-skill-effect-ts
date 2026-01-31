// Rule: Never use manual &&/|| for predicates; use Predicate.and/or/not
// Example: Struct predicate (bad example)
// @rule-id: rule-014
// @category: native-apis
// @original-name: struct-predicate

// Bad: Manual &&/|| for predicates instead of Predicate.and/or/not
export const isValidInput = (input: unknown): boolean =>
	typeof input === "object" &&
	input !== null &&
	typeof (input as Record<string, unknown>).name === "string" &&
	typeof (input as Record<string, unknown>).age === "number";
