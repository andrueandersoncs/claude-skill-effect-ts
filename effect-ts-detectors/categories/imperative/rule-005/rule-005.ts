// Rule: Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach
// Example: Effectful iteration
// @rule-id: rule-005
// @category: imperative
// @original-name: effectful-iteration

import { Effect } from "effect";
import { processItem } from "../../_fixtures.js";

declare const items: ReadonlyArray<string>;

// ✅ Good: Effect.forEach for effectful iteration
const goodExample = Effect.gen(function* () {
	const results = yield* Effect.forEach(items, processItem);
	return results;
});

export { goodExample };
