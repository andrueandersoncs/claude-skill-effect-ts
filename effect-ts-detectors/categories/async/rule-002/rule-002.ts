// Rule: Never use yield or await in Effect.gen; use yield*
// Example: Correct generator usage
// @rule-id: rule-002
// @category: async
// @original-name: generator-yield

import { Effect } from "effect";
import { getOrders, getUser, type UserId } from "../../_fixtures.js";

declare const id: UserId;
declare const fetchUserFromApi: (id: string) => Promise<{ name: string }>;

// GOOD: Use yield* in Effect.gen to unwrap Effects and get their values
const program = Effect.gen(function* () {
	const user = yield* getUser(id); // Correct: yield* unwraps the Effect
	const orders = yield* getOrders(id); // Correct: yield* unwraps the Effect
	return { user, orders };
});

// GOOD: For Promise-based APIs, wrap with Effect.promise and use yield*
const programWithPromise = Effect.gen(function* () {
	const user = yield* Effect.promise(() => fetchUserFromApi(id)); // Correct: wrap Promise in Effect.promise
	return { user };
});

export { program, programWithPromise };
