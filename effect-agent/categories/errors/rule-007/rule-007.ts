// Rule: Never rethrow transformed errors; use Effect.mapError
// Example: Transform low-level to domain errors
// @rule-id: rule-007
// @category: errors
// @original-name: map-error

import { Effect } from "effect";
import { ApiError, RawNetworkError } from "../../_fixtures.js";

declare const url: string;

// ✅ Good: Effect.mapError to transform errors
const result = Effect.gen(function* () {
	return yield* Effect.tryPromise({
		try: () => fetch(url),
		catch: (e) => new RawNetworkError({ cause: e }),
	}).pipe(Effect.mapError((e) => new ApiError({ url, cause: e })));
});

export { result };
