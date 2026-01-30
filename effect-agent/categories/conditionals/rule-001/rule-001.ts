// Rule: Never use array empty checks; use Array.match
// Example: First element with fallback
// @rule-id: rule-001
// @category: conditionals
// @original-name: array-empty-check

import { Array, Function } from "effect";
import { defaultItem, type Item } from "../../_fixtures.js";

declare const items: ReadonlyArray<Item>;

// ✅ Good: Array.match for empty/non-empty handling
const first = Array.match(items, {
	onEmpty: Function.constant(defaultItem),
	onNonEmpty: (arr) => Array.headNonEmpty(arr),
});

export { first };
