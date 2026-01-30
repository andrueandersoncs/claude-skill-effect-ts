// Rule: Never add section marker comments; use file organization and clear naming instead
// Example: Code organization

import { Context, type Effect, Schema } from "effect";
import { UserId } from "../_fixtures.js";

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

// ✅ Good: Clear naming without section markers
class User extends Schema.Class<User>("User")({
	id: UserId,
	name: Schema.NonEmptyString,
}) {}

class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: typeof UserId.Type) => Effect.Effect<User>;
	}
>() {}

export { type UserBad, UserServiceBad, User, UserService };
