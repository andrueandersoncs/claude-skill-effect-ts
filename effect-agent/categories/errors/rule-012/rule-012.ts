// Rule: Never use untyped errors; use Schema.TaggedError
// Example: Multiple error types
// @rule-id: rule-012
// @category: errors
// @original-name: typed-errors

import { Effect } from "effect";
import { defaultUser, getUser, type UserId } from "../../_fixtures.js";

declare const id: UserId;

// ✅ Good: Schema.TaggedError with catchTag for specific handling
const program = getUser(id).pipe(
	Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser)),
);

export { program };
