// Rule: Never provide TestClock.layer manually; it.effect includes it automatically
// Example: Time-based testing
// @rule-id: rule-015
// @category: testing
// @original-name: test-clock

import { it } from "@effect/vitest";
import { Effect, Fiber, TestClock } from "effect";

// GOOD: it.effect automatically provides TestClock - just use TestClock.adjust directly
it.effect("should timeout after delay", () =>
	Effect.gen(function* () {
		const fiber = yield* Effect.fork(Effect.sleep("1 hour"));
		// TestClock.adjust works because it.effect provides TestClock.layer automatically
		yield* TestClock.adjust("1 hour");
		yield* Fiber.join(fiber);
	}),
);

// GOOD: Multiple time adjustments work naturally
it.effect("should handle multiple delays", () =>
	Effect.gen(function* () {
		const fiber1 = yield* Effect.fork(Effect.sleep("30 minutes"));
		const fiber2 = yield* Effect.fork(Effect.sleep("1 hour"));

		yield* TestClock.adjust("30 minutes");
		yield* Fiber.join(fiber1);

		yield* TestClock.adjust("30 minutes");
		yield* Fiber.join(fiber2);
	}),
);
