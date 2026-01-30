// Rule: Never use yield or await in Effect.gen; use yield*
// Example: Correct generator usage (bad example)
// @rule-id: rule-002
// @category: async
// @original-name: generator-yield

import { Effect } from "effect";

declare const id: string;
declare const getUser: (id: string) => Effect.Effect<{ name: string }>;
declare const getOrders: (id: string) => Effect.Effect<Array<{ id: string }>>;

// ❌ Bad: Using yield without * (the pattern that doesn't work)
// Note: The actual bad code `yield getOrders(id)` won't compile in strict TS
// This demonstrates what the correct version looks like - the bad pattern is:
// const orders = yield getOrders(id)  // Missing * - returns Effect, not value
const programBad = Effect.gen(function* () {
	const user = yield* getUser(id);
	const orders = yield* getOrders(id);
	return { user, orders };
});

export { programBad };
