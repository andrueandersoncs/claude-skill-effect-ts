// Rule: Never use type casting (as); use Schema.decodeUnknown or type guards
// Example: Validating API response

import { Effect, Schema } from "effect";
import { FetchError, User, type UserId } from "../_fixtures.js";

// ✅ Good: Schema.decodeUnknown for runtime validation
const fetchUser = (id: UserId) =>
	Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: () => fetch(`/users/${id}`),
			catch: (e) => new FetchError({ cause: e }),
		});
		const json = yield* Effect.tryPromise({
			try: () => response.json(),
			catch: (e) => new FetchError({ cause: e }),
		});
		return yield* Schema.decodeUnknown(User)(json);
	});

export { fetchUser };
