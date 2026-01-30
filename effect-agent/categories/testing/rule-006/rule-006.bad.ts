// Rule: Never use hard-coded test data; use it.effect.prop with Schema
// Example: Multiple test inputs (bad example)
// @rule-id: rule-006
// @category: testing
// @original-name: it-effect-prop

// Declare external test functions
declare function it(name: string, fn: () => Promise<void>): void;
declare function expect<T>(value: T): { toBeDefined(): void };

// Declare the order type and processor
interface Order {
	id: string;
	total: number;
	items: string[];
}

declare function processOrder(order: Order): Promise<{ status: string }>;

// BAD: Hard-coded test data
const testOrders: Order[] = [
	{ id: "order-1", total: 100, items: ["a", "b"] },
	{ id: "order-2", total: 200, items: ["c"] },
	{ id: "order-3", total: 50, items: [] },
];

// BAD: Using forEach with hard-coded data instead of property-based testing
testOrders.forEach((order) => {
	it(`should process order ${order.id}`, async () => {
		const result = await processOrder(order);
		expect(result).toBeDefined();
	});
});

export { testOrders };
