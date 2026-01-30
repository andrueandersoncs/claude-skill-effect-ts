// Rule: Never import from vitest directly; use @effect/vitest
// Example: Test file imports (bad example)
// @rule-id: rule-004
// @category: testing
// @original-name: effect-vitest-imports

import { Effect } from "effect";
// BAD: Importing from vitest directly instead of @effect/vitest
import { describe, expect, it } from "vitest";

// Declare external function and data
declare function createUser(data: unknown): Effect.Effect<{ id: string }>;
declare const data: { name: string; email: string };

// BAD: Using raw vitest imports with Effect
describe("UserService", () => {
	it("should create user", async () => {
		const result = await Effect.runPromise(createUser(data));
		expect(result).toBeDefined();
	});
});

export { describe, it };
