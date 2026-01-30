// Rule: Never use try/catch for error assertions; use Effect.exit
// Example: Asserting on error type and data

import { expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, Option, Schema } from "effect";
import { getUser, type UserId, UserNotFound } from "../_fixtures.js";

// ✅ Good: Effect.exit for error assertions
it.effect("should fail with UserNotFound", () =>
	Effect.gen(function* () {
		const exit = yield* Effect.exit(getUser("nonexistent" as UserId));

		expect(Exit.isFailure(exit)).toBe(true);

		Exit.match(exit, {
			onFailure: (cause) => {
				const error = Option.getOrThrow(Cause.failureOption(cause));
				expect(Schema.is(UserNotFound)(error)).toBe(true);
				expect(error.userId).toBe("nonexistent");
			},
			onSuccess: () => expect.fail("Expected failure"),
		});
	}),
);
