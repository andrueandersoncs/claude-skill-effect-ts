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
	Match.tag("Circle", (c) => c.radius * Math.PI * 2), // Can't use c.area() here!
	Match.tag("Rectangle", (r) => r.width * r.height), // Can't use r.area() here!
	Match.exhaustive,
);

export { processBad };
