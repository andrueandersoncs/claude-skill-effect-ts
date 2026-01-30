// Rule: Never use yield or await in Effect.gen; use yield*
// Example: Correct generator usage
// @rule-id: rule-002
// @category: async
// @original-name: generator-yield

import { Effect } from "effect";
import { getOrders, getUser, type UserId } from "../_fixtures.js";

declare const id: UserId;

// ✅ Good: Use yield* in Effect.gen
const program = Effect.gen(function* () {
	const user = yield* getUser(id); // Correct: yield*
	const orders = yield* getOrders(id); // Correct: yield*
	return { user, orders };
});

export { program };
