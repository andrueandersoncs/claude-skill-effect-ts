// Rule: Use Effect.gen() for multi-step sequential operations
// Example: Multiple dependent operations

import { Effect } from "effect";
import {
	getOrder,
	type OrderId,
	ProcessedOrder,
	saveOrder,
	validateOrder,
} from "../_fixtures.js";

// ✅ Good: Effect.gen for multi-step operations
const processOrder = (orderId: OrderId) =>
	Effect.gen(function* () {
		const order = yield* getOrder(orderId);
		const validated = yield* validateOrder(order);
		const saved = yield* Effect.promise(() => saveOrder(validated));
		return new ProcessedOrder({ order: saved, status: "completed" });
	});

export { processOrder };
