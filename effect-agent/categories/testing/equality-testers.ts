// Rule: Never skip addEqualityTesters(); call it for Effect type equality
// Example: Setup for Effect equality assertions

// In vitest.setup.ts or at top of test file
import { addEqualityTesters, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";

addEqualityTesters();

declare const getOption: () => Effect.Effect<Option.Option<number>>;

// ✅ Good: Effect types compare correctly with equality testers
it.effect("should match", () =>
	Effect.gen(function* () {
		const result = yield* getOption();
		expect(result).toEqual(Option.some(42)); // Works correctly
	}),
);
