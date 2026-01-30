// Rule: Never use throw statements; use Effect.fail()
// Example: Conditional throw based on state
// @rule-id: rule-004
// @category: errors
// @original-name: conditional-fail

import { Effect, Match } from "effect";
import {
	InvalidTotal,
	type Order,
	OrderCancelled,
	processValidOrder,
} from "../../_fixtures.js";

// ✅ Good: Match with Effect.fail for typed errors
const processOrder = (order: Order) =>
	Match.value(order).pipe(
		Match.when({ status: "cancelled" }, () =>
			Effect.fail(new OrderCancelled({ orderId: order.id })),
		),
		Match.when({ total: (t: number) => t <= 0 }, () =>
			Effect.fail(new InvalidTotal({ total: order.total })),
		),
		Match.orElse(() => processValidOrder(order)),
	);

export { processOrder };
