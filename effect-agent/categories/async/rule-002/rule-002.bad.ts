// Rule: Never use yield or await in Effect.gen; use yield*
// Example: Incorrect generator usage (bad example)
// @rule-id: rule-002
// @category: async
// @original-name: generator-yield

import { Effect } from "effect";

declare const id: string;
declare const getUser: (id: string) => Effect.Effect<{ name: string }>;
declare const getOrders: (id: string) => Effect.Effect<Array<{ id: string }>>;
declare const fetchUserFromApi: (id: string) => Promise<{ name: string }>;

// BAD: Using yield without * in Effect.gen
// This returns the Effect itself, not the unwrapped value
const programWithYield = Effect.gen(function* () {
	// @ts-expect-error - yield without * returns Effect, not the value
	const user = yield getUser(id); // Missing * - returns Effect, not value
	// @ts-expect-error - yield without * returns Effect, not the value
	const orders = yield getOrders(id); // Missing * - returns Effect, not value
	return { user, orders };
});

// BAD: Using await in Effect.gen
// This mixes async/await with Effect's generator pattern incorrectly
const programWithAwait = Effect.gen(function* () {
	// @ts-expect-error - await should not be used in Effect.gen
	const user = await fetchUserFromApi(id); // Should use yield* Effect.promise()
	return { user };
});

export { programWithYield, programWithAwait };
