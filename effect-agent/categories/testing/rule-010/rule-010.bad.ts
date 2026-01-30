// Rule: Never manage resources manually in tests; use it.scoped
// Example: Testing with acquireRelease resources (bad example)
// @rule-id: rule-010
// @category: testing
// @original-name: it-scoped

import { it } from "@effect/vitest";
import { Effect } from "effect";

// Declare external test functions
declare function expect<T>(value: T): { toBeDefined(): void };

// Declare database connection type
interface DatabaseConnection {
	query(sql: string): Effect.Effect<unknown>;
	close(): Effect.Effect<void>;
}

declare function connect(): Effect.Effect<DatabaseConnection>;

// BAD: Manual resource management with try/finally in it.effect
// Should use it.scoped with acquireRelease instead
it.effect("should use database connection", () =>
	Effect.gen(function* () {
		// BAD: Manual cleanup with finally block instead of acquireRelease
		const conn = yield* connect();
		try {
			const result = yield* conn.query("SELECT 1");
			expect(result).toBeDefined();
		} finally {
			yield* conn.close();
		}
	}),
);

export { connect };
