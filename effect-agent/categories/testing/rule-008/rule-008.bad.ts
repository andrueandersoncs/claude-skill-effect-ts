// Rule: Never use it.effect when you need real time; use it.live
// Example: Testing with real clock/environment (bad example)
// @rule-id: rule-008
// @category: testing
// @original-name: it-live

import { it } from "@effect/vitest";
import { Effect } from "effect";

// Declare external test function
declare function expect<T>(value: T): {
	toBeGreaterThanOrEqual(n: number): void;
};

// BAD: Using it.effect when real time is needed (uses TestClock - no real delay!)
it.effect("should measure real time", () =>
	Effect.gen(function* () {
		const start = Date.now();
		yield* Effect.sleep("10 millis"); // Uses TestClock - no real delay!
		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(10); // Fails!
	}),
);

export { it };
