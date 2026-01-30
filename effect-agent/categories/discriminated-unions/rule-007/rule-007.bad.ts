// Rule: Never extract types from ._tag; use the union type directly
// Example: Extracting _tag as a type (bad example)
// @rule-id: rule-007
// @category: discriminated-unions
// @original-name: use-union-directly

import type { AppEvent } from "../../_fixtures.js";

// ❌ Bad: Extracting _tag as a type
type EventType = AppEvent["_tag"];

// Using extracted tag loses type safety
const handleByTagBad = (tag: EventType) => {
	// Can't access event properties, only have the tag string
	console.log(tag);
};

export { type EventType, handleByTagBad };
