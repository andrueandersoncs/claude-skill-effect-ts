// Rule: Never check error._tag manually; use Effect.catchTag
// Example: Recovering from specific errors

import { Effect } from "effect";
import { defaultUser, getUser, type UserId } from "../_fixtures.js";

declare const id: UserId;

// ✅ Good: Effect.catchTag for specific error handling
const result = getUser(id).pipe(
	Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser)),
);

export { result };
