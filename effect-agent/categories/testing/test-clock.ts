// Rule: Never provide TestClock.layer manually; it.effect includes it automatically
// Example: Time-based testing

import { it } from "@effect/vitest";
import { Effect, Fiber, TestClock } from "effect";

// ✅ Good: it.effect automatically provides TestClock
it.effect("should timeout after delay", () =>
	Effect.gen(function* () {
		const fiber = yield* Effect.fork(Effect.sleep("1 hour"));
		yield* TestClock.adjust("1 hour");
		yield* Fiber.join(fiber);
	}),
);
