// Rule: Never use try/catch blocks; use Effect.try()
// Example: Multiple try/catch blocks
// @rule-id: rule-006
// @category: errors
// @original-name: effect-try

import { Effect, Schema } from "effect";
import {
	InvalidOrderJson,
	Order,
	SaveOrderError,
	saveOrder,
} from "../_fixtures.js";

const OrderFromJson = Schema.parseJson(Order);

// ✅ Good: Effect pipeline with typed errors
const processOrder = (data: string) =>
	Effect.gen(function* () {
		const order = yield* Schema.decodeUnknown(OrderFromJson)(data).pipe(
			Effect.mapError(() => new InvalidOrderJson({ data })),
		);

		yield* Effect.tryPromise({
			try: () => saveOrder(order),
			catch: (e) => new SaveOrderError({ orderId: order.id, cause: e }),
		});
	});

export { processOrder };
