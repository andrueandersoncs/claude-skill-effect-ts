// Rule: Never use Match.tag when you need class methods; use Schema.is()
// Example: Choosing between Schema.is() and Match.tag (bad example)
// @rule-id: rule-004
// @category: discriminated-unions
// @original-name: schema-is-vs-match-tag

import { Match } from "effect";
import type { Shape } from "../../_fixtures.js";

// ❌ Bad: Using Match.tag when you need class methods
// Match.tag doesn't preserve the class instance, so methods won't work
const processBad = Match.type<Shape>().pipe(
	Match.tag("Circle", (c) => c.area), // This will fail at runtime - Match.tag doesn't preserve class instances
	Match.tag("Rectangle", (r) => r.area), // Same issue - method calls won't work
	Match.exhaustive,
);

export { processBad };
