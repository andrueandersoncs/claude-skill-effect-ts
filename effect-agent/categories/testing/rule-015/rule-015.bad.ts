// Rule: Never provide TestClock.layer manually; it.effect includes it automatically
// Example: Time-based testing (bad example)
// @rule-id: rule-015
// @category: testing
// @original-name: test-clock

import { Effect, Fiber, type Layer, TestClock } from "effect";

// Declare external test function
declare function it(name: string, fn: () => Promise<void>): void;

// Declare a fully-resolved TestClock layer for demonstration
declare const FullTestClockLayer: Layer.Layer<TestClock.TestClock>;

// BAD: Manually providing TestClock (it.effect includes it automatically)
export function badTestClockUsage(): void {
	it("should timeout after delay", async () => {
		// BAD: Manually providing TestClock layer using Effect.runPromise
		// instead of using it.effect which includes TestClock automatically
		const effect = Effect.gen(function* () {
			const fiber = yield* Effect.fork(Effect.sleep("1 hour"));
			yield* TestClock.adjust("1 hour");
			yield* Fiber.join(fiber);
		}).pipe(
			// BAD: This manual layer composition is unnecessary with it.effect
			Effect.provide(FullTestClockLayer),
		);

		await Effect.runPromise(effect);
	});
}
