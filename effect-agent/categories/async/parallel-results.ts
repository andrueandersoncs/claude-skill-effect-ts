// Rule: Never use Promise.all; use Effect.all
// Example: Named parallel results

import { Effect } from "effect";
import { getOrders, getUser, type UserId } from "../_fixtures.js";

declare const id: UserId;

// ✅ Good: Effect.all with named results
const goodExample = Effect.gen(function* () {
	const { user, orders } = yield* Effect.all({
		user: getUser(id),
		orders: getOrders(id),
	});
	return { user, orders };
});

export { goodExample };
