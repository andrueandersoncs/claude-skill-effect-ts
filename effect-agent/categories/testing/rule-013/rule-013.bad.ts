// Rule: Never write manual property tests; use it.effect.prop
// Example: Property test with Effect (bad example)
// @rule-id: rule-013
// @category: testing
// @original-name: property-based

import { Effect } from "effect";
import * as fc from "fast-check";

// Declare external test functions
declare function it(name: string, fn: () => void): void;
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

declare function processOrder(order: Order): Effect.Effect<OrderResult>;

// BAD: Using raw fc.assert/fc.property instead of it.effect.prop
it("should process orders correctly", () => {
	fc.assert(
		fc.asyncProperty(
			fc.record({
				id: fc.string(),
				total: fc.integer({ min: 0 }),
				items: fc.array(fc.string()),
			}),
			async (order) => {
				const result = await Effect.runPromise(processOrder(order));
				expect(result.status).toBe("completed");
			},
		),
	);
});

export { fc };
