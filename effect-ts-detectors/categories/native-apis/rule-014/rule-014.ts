// Rule: Never use manual &&/|| for predicates; use Predicate.and/or/not
// Example: Struct predicate
// @rule-id: rule-014
// @category: native-apis
// @original-name: struct-predicate

import { Predicate } from "effect";

// ✅ Good: Predicate.struct for structural validation
const isValidInput = Predicate.struct({
	name: Predicate.isString,
	age: Predicate.isNumber,
});

export { isValidInput };
