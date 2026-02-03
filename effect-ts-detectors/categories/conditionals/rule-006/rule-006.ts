// Rule: Never use null checks (if x != null); use Option.match
// Example: Effectful handling of nullable
// @rule-id: rule-006
// @category: conditionals
// @original-name: nullable-option-match

import { Effect, Option } from "effect";
import { sendEmail, type User } from "../../_fixtures.js";

declare const maybeUser: Option.Option<User>;

// ✅ Good: Option.match for nullable handling
const notifyResult = Option.match(maybeUser, {
	onNone: () => Effect.log("No user to notify"),
	onSome: (user) => sendEmail(user.email),
});

export { notifyResult };
