// Rule: Never use fail-fast Promise.all; use Effect.all with mode: "either"
// Example: Get Either results for each operation

import { Array, Effect } from "effect";
import { processItem } from "../_fixtures.js";

declare const items: ReadonlyArray<string>;

// ✅ Good: Effect.all with mode: "either" for non-fail-fast
const result = Effect.gen(function* () {
	// Each result is Either<E, A>
	const results = yield* Effect.all(Array.map(items, processItem), {
		mode: "either",
	});
	return results;
});

export { result };
