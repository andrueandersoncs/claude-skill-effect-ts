// Rule: Use property-based testing with Schema: it.prop, it.effect.prop, and Arbitrary.make
// Example: Anti-patterns in property-based testing (bad example)
// @rule-id: rule-006
// @category: testing
// @original-name: property-based-testing

import { layer } from "@effect/vitest";
import { Context, Effect, Layer } from "effect";
// BAD: Importing fast-check directly instead of using Schema
import * as fc from "fast-check";

// Declare external test functions
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function expect<T>(value: T): {
	toBe(expected: unknown): void;
	toBeDefined(): void;
};

// Declare types
interface User {
	id: string;
	name: string;
	email: string;
}

interface Order {
	id: string;
	total: number;
	items: string[];
}

interface OrderResult {
	status: string;
}

interface MyService {
	readonly getUser: (id: string) => Effect.Effect<User, Error>;
	readonly updateUser: (user: User) => Effect.Effect<User, Error>;
	readonly deleteUser: (id: string) => Effect.Effect<void, Error>;
}

const MyService = Context.GenericTag<MyService>("MyService");

declare function processOrder(order: Order): Effect.Effect<OrderResult>;
declare const TestServicesLayer: Layer.Layer<never>;

// === Anti-Pattern 1: Stubbing methods as "not implemented" ===
// BAD: Won't be able to test code paths that use these methods

export const TestLayerBad = Layer.succeed(MyService, {
	getUser: (id) =>
		Effect.succeed({ id, name: "Hardcoded", email: "test@test.com" }),
	updateUser: () => Effect.fail(new Error("Not implemented")), // Won't test this path!
	deleteUser: () => Effect.fail(new Error("Not implemented")),
});

// === Anti-Pattern 2: Hardcoded test data arrays ===
// BAD: Limited coverage, same values every test run

const testOrders: Order[] = [
	{ id: "order-1", total: 100, items: ["a", "b"] },
	{ id: "order-2", total: 200, items: ["c"] },
	{ id: "order-3", total: 50, items: [] },
];

// BAD: Using forEach with hard-coded data instead of property-based testing
testOrders.forEach((order) => {
	it(`should process order ${order.id}`, async () => {
		const result = await Effect.runPromise(processOrder(order));
		expect(result).toBeDefined();
	});
});

// === Anti-Pattern 3: Raw fast-check arbitraries ===
// BAD: Using raw fast-check instead of Schema-based generators

it("should be commutative", () => {
	fc.assert(
		fc.property(fc.integer(), fc.integer(), (a, b) => {
			expect(a + b).toBe(b + a);
		}),
	);
});

// === Anti-Pattern 4: Manual fc.assert with asyncProperty ===
// BAD: Should use it.effect.prop instead

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

// === Anti-Pattern 5: layer() without property-based tests ===
// BAD: Using layer() but only with hardcoded test data

layer(TestServicesLayer)("OrderProcessor", (it) => {
	// BAD: Only hard-coded test cases, no property-based testing
	it.effect("should process order", () =>
		Effect.gen(function* () {
			const testOrder = { id: "order-1", total: 100, items: ["item-1"] };
			const result = yield* processOrder(testOrder);
			expect(result.status).toBe("completed");
		}),
	);
});

export { testOrders, fc };
