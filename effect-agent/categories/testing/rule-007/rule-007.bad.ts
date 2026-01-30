// Rule: Never use Effect.runPromise in tests; use it.effect from @effect/vitest
// Example: Test with service dependencies (bad example)
// @rule-id: rule-007
// @category: testing
// @original-name: it-effect

import { Effect, type Layer } from "effect";

// Declare external test functions
declare function it(name: string, fn: () => Promise<void>): void;
declare function expect<T>(value: T): { toBe(expected: unknown): void };

// Declare external types and values
interface Order {
	id: string;
	total: number;
}

interface OrderResult {
	status: string;
}

declare function processOrder(order: Order): Effect.Effect<OrderResult>;
declare const TestLayer: Layer.Layer<never>;
declare const order: Order;

// BAD: Using Effect.runPromise in tests instead of it.effect
it("should process order", async () => {
	const result = await Effect.runPromise(
		processOrder(order).pipe(Effect.provide(TestLayer)),
	);
	expect(result.status).toBe("completed");
});

export { order };
