// Rule: Never provide TestClock.layer manually; it.effect includes it automatically
// Example: Time-based testing (bad example)
// @rule-id: rule-015
// @category: testing
// @original-name: test-clock

import { it } from "@effect/vitest";
import { Effect, Fiber, TestClock } from "effect";

// BAD: Manually providing TestClock.layer (it.effect includes it automatically)
it.effect("should timeout after delay", () =>
	Effect.gen(function* () {
		const fiber = yield* Effect.fork(Effect.sleep("1 hour"));
		// BAD: Manually adjusting TestClock
		// This works but is verbose - it.effect already provides TestClock
		yield* TestClock.adjust("1 hour");
		yield* Fiber.join(fiber);
	}),
);
