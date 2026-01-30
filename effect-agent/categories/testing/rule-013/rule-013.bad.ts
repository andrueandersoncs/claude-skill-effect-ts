// Rule: Never write manual property tests; use it.effect.prop
// Example: Property test with Effect (bad example)
// @rule-id: rule-013
// @category: testing
// @original-name: property-based

import { Effect } from "effect";

// Declare external test functions
declare function it(name: string, fn: () => Promise<void>): void;
declare function expect<T>(value: T): { toBe(expected: unknown): void };

// Declare order type and processor
interface Order {
	id: string;
	total: number;
	items: string[];
}

interface OrderResult {
	status: string;
}

declare function generateTestOrders(count: number): Order[];
declare function processOrder(order: Order): Effect.Effect<OrderResult>;

// BAD: Manual property test loop instead of it.effect.prop
it("should process orders correctly", async () => {
	const orders = generateTestOrders(100);

	for (const order of orders) {
		const result = await Effect.runPromise(processOrder(order));
		expect(result.status).toBe("completed");
	}
});

export { generateTestOrders };
