// Rule: Never test with partial coverage; combine layer() with property-based tests
// Example: Full property-based integration test (bad example)
// @rule-id: rule-011
// @category: testing
// @original-name: layer-effect-prop

import { layer } from "@effect/vitest";
import { Effect, type Layer } from "effect";

// Declare external test functions
declare function expect<T>(value: T): { toBe(expected: unknown): void };

// Declare order type and processor
interface Order {
	id: string;
	total: number;
	userId: string;
}

interface OrderResult {
	status: string;
}

declare function processOrder(order: Order): Effect.Effect<OrderResult>;
declare const TestServicesLayer: Layer.Layer<never>;

// BAD: Using layer() but no property-based tests
// Should add property-based testing for full coverage
layer(TestServicesLayer)("OrderProcessor", (it) => {
	// BAD: Only hard-coded test cases, no property-based testing
	it.effect("should process order", () =>
		Effect.gen(function* () {
			const testOrder = { id: "order-1", total: 100, userId: "user-1" };
			const result = yield* processOrder(testOrder);
			expect(result.status).toBe("completed");
		}),
	);
});

export { TestServicesLayer };
