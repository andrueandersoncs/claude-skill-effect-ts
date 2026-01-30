// Rule: Never use Data.TaggedError; use Schema.TaggedError for full compatibility
// Example: Error handling with Schema.TaggedError (bad example)
// @rule-id: rule-005
// @category: discriminated-unions
// @original-name: schema-tagged-error

import { Data } from "effect";
import type { User, UserId } from "../../_fixtures.js";

// ❌ Bad: Using Data.TaggedError (doesn't work with Schema.is)
class UserNotFoundBad extends Data.TaggedError("UserNotFoundBad")<{
	userId: UserId;
}> {}

// Declare for the example
declare const error: UserNotFoundBad | Error;
declare const defaultUser: User;

// ❌ Bad: Checking error._tag directly
const handleErrorBad = () => {
	if ("_tag" in error && error._tag === "UserNotFoundBad") {
		return defaultUser;
	}
	throw error;
};

export { UserNotFoundBad, handleErrorBad };
