// Rule: Never test with partial coverage; combine layer() with it.effect.prop
// Example: Full property-based integration test (bad example)
// @rule-id: rule-011
// @category: testing
// @original-name: layer-effect-prop

import { Effect, type Layer } from "effect";

// Declare external test functions
declare function it(name: string, fn: () => Promise<void>): void;
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
declare const RealServicesLayer: Layer.Layer<never>;

// BAD: Partial coverage with hard-coded data + real services
it("should process order", async () => {
	const testOrder = { id: "order-1", total: 100, userId: "user-1" };
	const result = await Effect.runPromise(
		processOrder(testOrder).pipe(Effect.provide(RealServicesLayer)),
	);
	expect(result.status).toBe("completed");
});

export { RealServicesLayer };
