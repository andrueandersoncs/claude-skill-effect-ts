// Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
// Example: Switch exhaustiveness
// @rule-id: rule-007
// @category: code-style
// @original-name: exhaustive-match

import { Function, Match } from "effect";

type Status = "pending" | "active" | "completed";

// GOOD: Match.exhaustive for compile-time exhaustive handling
// Adding a new Status variant will cause a compile error until handled
const handleStatus = Match.type<Status>().pipe(
	Match.when("pending", Function.constant("Waiting")),
	Match.when("active", Function.constant("Running")),
	Match.when("completed", Function.constant("Done")),
	Match.exhaustive,
);

// GOOD: Match.exhaustive with discriminated unions
type Event =
	| { readonly _tag: "Started"; readonly timestamp: number }
	| { readonly _tag: "Completed"; readonly result: string }
	| { readonly _tag: "Failed"; readonly error: Error };

const describeEvent = Match.type<Event>().pipe(
	Match.tag("Started", (e) => `Started at ${e.timestamp}`),
	Match.tag("Completed", (e) => `Completed with: ${e.result}`),
	Match.tag("Failed", (e) => `Failed: ${e.error.message}`),
	Match.exhaustive,
);

export { handleStatus, describeEvent };
