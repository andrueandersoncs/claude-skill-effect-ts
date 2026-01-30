// Rule: Never import from vitest directly; use @effect/vitest
// Example: Test file imports

import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createUser } from "../_fixtures.js";

// ✅ Good: Use @effect/vitest for all test utilities
describe("UserService", () => {
	it.effect("should create user", () =>
		Effect.gen(function* () {
			const result = yield* createUser({});
			expect(result).toBeDefined();
		}),
	);
});
