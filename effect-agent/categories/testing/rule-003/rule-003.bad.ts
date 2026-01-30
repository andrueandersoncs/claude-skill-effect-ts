// Rule: Never use try/catch for error assertions; use Effect.exit
// Example: Asserting on error type and data (bad example)
// @rule-id: rule-003
// @category: testing
// @original-name: effect-exit

import { Effect } from "effect";

// Declare external functions
declare function it(name: string, fn: () => Promise<void>): void;
declare function fail(message: string): void;
declare function expect<T>(value: T): { toBe(expected: unknown): void };

// Declare the Effect we're testing
declare function getUser(id: string): Effect.Effect<unknown, { _tag: string }>;

// BAD: Using try/catch for error assertions
export function badErrorAssertion(): void {
	it("should fail with UserNotFound", async () => {
		try {
			await Effect.runPromise(getUser("nonexistent"));
			fail("Expected error");
		} catch (e) {
			expect((e as { _tag: string })._tag).toBe("UserNotFound");
		}
	});
}
