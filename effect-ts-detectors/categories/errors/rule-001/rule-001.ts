// Rule: Never use fail-fast Promise.all; use Effect.all with mode: "either"
// Example: Get Either results for each operation
// @rule-id: rule-001
// @category: errors
// @original-name: all-either-mode

import { Array, Effect } from "effect";
import { processItem } from "../../_fixtures.js";

declare const items: ReadonlyArray<string>;

// ✅ Good: Effect.all with mode: "either" for non-fail-fast
const result = Effect.gen(function* () {
	// Each result is Either<E, A>
	const effects = Array.map(items, processItem);
	const results = yield* Effect.all(effects, {
		mode: "either",
	});
	return results;
});

export { result };
