// Rule: Never use null checks (if x != null); use Option.match
// Example: Effectful handling of nullable

import { Effect, Option } from "effect";
import { sendEmail, type User } from "../_fixtures.js";

declare const maybeUser: Option.Option<User>;

// ✅ Good: Option.match for nullable handling
const result = Option.match(maybeUser, {
	onNone: () => Effect.log("No user to notify"),
	onSome: (user) => sendEmail(user.email),
});

export { result };
