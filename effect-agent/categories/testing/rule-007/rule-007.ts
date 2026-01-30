// Rule: Never use Effect.runPromise in tests; use it.effect from @effect/vitest
// Example: Test with service dependencies
// @rule-id: rule-007
// @category: testing
// @original-name: it-effect

import { describe, expect, it } from "@effect/vitest";
import { Effect, type Layer } from "effect";
import { type Order, processOrder } from "../_fixtures.js";

declare const TestLayer: Layer.Layer<never>;
declare const order: Order;

// ✅ Good: Use it.effect from @effect/vitest
describe("Order Processing", () => {
	it.effect("should process order", () =>
		Effect.gen(function* () {
			const result = yield* processOrder(order);
			expect(result.status).toBe("completed");
		}).pipe(Effect.provide(TestLayer)),
	);
});
