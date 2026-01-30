// Rule: Never add section marker comments; use file organization and clear naming instead
// Example: Code organization (bad example)
// @rule-id: rule-002
// @category: comments
// @original-name: code-organization

import { Context, type Effect } from "effect";

// ❌ Bad: Section marker comments
// ============ Types ============
type UserBad = {
	id: string;
	name: string;
};

// ============ Services ============
class UserServiceBad extends Context.Tag("UserServiceBad")<
	UserServiceBad,
	{ readonly getUser: (id: string) => Effect.Effect<UserBad> }
>() {}

export { type UserBad, UserServiceBad };
