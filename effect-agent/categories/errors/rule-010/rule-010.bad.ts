// Rule: Never use try/catch for Effect errors; use Effect.sandbox with catchTags
// Example: Handling defects and expected errors (bad example)
// @rule-id: rule-010
// @category: errors
// @original-name: sandbox-catch-tags

import { Effect } from "effect";

// Declare the program
declare const program: Effect.Effect<void, Error>;

// ❌ Bad:
export async function runProgram(): Promise<void> {
	try {
		await Effect.runPromise(program);
	} catch (e) {
		// Can't distinguish between expected errors and defects
		console.error(e);
	}
}
