// Rule: Never skip addEqualityTesters(); call it for Effect type equality
// Example: Setup for Effect equality assertions (bad example)
// @rule-id: rule-005
// @category: testing
// @original-name: equality-testers
// In vitest.setup.ts or at top of test file

// BAD: Effect types may not compare correctly in expect() without addEqualityTesters
import { expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";

// Declare external function
declare function getOption(): Effect.Effect<Option.Option<number>>;

// BAD: Not calling addEqualityTesters() before using equality on Effect types
it.effect("should match", () =>
	Effect.gen(function* () {
		const result = yield* getOption();
		expect(result).toEqual(Option.some(42)); // May fail incorrectly
	}),
);

export { expect };
