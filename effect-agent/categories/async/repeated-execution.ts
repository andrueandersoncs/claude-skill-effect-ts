// Rule: Never use setTimeout/setInterval; use Effect.sleep and Schedule
// Example: Repeated execution

import { Effect, Schedule } from "effect";
import { pollForUpdates } from "../_fixtures.js";

// ✅ Good: Effect.repeat with Schedule.spaced
const result = Effect.gen(function* () {
	yield* Effect.repeat(pollForUpdates, Schedule.spaced("5 seconds"));
});

export { result };
