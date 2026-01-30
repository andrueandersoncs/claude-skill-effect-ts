// Rule: Never use array empty checks; use Array.match
// Example: First element with fallback (bad example)
// @rule-id: rule-001
// @category: conditionals
// @original-name: array-empty-check

import { defaultItem, type Item } from "../../_fixtures.js";

declare const items: ReadonlyArray<Item>;

// Bad: Using length check instead of Array.match
const first = items.length > 0 ? items[0] : defaultItem;

export { first };
