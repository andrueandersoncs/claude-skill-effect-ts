// Rule: Never use raw fc.integer/fc.string; use it.prop with Schema
// Example: Converting raw fast-check to Schema-based (bad example)
// @rule-id: rule-009
// @category: testing
// @original-name: it-prop-schema

// BAD: Importing fast-check directly instead of using Schema
import * as fc from "fast-check";

// Declare external test function
declare function it(name: string, fn: () => void): void;
declare function expect<T>(value: T): { toBe(expected: unknown): void };

// BAD: Using raw fast-check arbitraries instead of Schema-based generators
it("should be commutative", () => {
	fc.assert(
		fc.property(fc.integer(), fc.integer(), (a, b) => {
			expect(a + b).toBe(b + a);
		}),
	);
});

export { fc };
