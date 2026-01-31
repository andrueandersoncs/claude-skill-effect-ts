// Rule: Never provide TestClock.layer manually; it.effect includes it automatically
// Example: Time-based testing (bad example)
// @rule-id: rule-015
// @category: testing
// @original-name: test-clock

import { it } from "@effect/vitest";
import { Effect, Fiber, TestClock } from "effect";

// BAD: Manually providing TestClock layer when using it.effect
// it.effect already includes TestClock automatically
it.effect("should timeout after delay", () =>
	Effect.gen(function* () {
		const fiber = yield* Effect.fork(Effect.sleep("1 hour"));
		yield* TestClock.adjust("1 hour");
		yield* Fiber.join(fiber);
	}).pipe(Effect.provide(TestClock.defaultTestClock)),
);

// BAD: Another pattern - providing TestClock layer separately
it.effect("another test with manual TestClock", () =>
	Effect.provide(
		Effect.gen(function* () {
			yield* Effect.sleep("5 minutes");
		}),
		TestClock.defaultTestClock,
	),
);
