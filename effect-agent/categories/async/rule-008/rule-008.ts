// Rule: Never use async functions; use Effect.gen with yield*
// Example: Wrapping external async library
// @rule-id: rule-008
// @category: async
// @original-name: wrap-external-async

import { Effect } from "effect";
import { LibraryError } from "../../_fixtures.js";

// External library stub
declare const externalLib: { doSomething: () => Promise<unknown> };

// ✅ Good: Wrap in Effect.tryPromise with typed error
const doSomething = Effect.tryPromise({
	try: () => externalLib.doSomething(),
	catch: (e) => new LibraryError({ cause: e }),
});

const useLibrary = Effect.gen(function* () {
	const result = yield* doSomething;
	return result;
});

export { doSomething, useLibrary };
