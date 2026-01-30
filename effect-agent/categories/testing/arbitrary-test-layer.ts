// Rule: Never hard-code values in test layers; use Arbitrary-generated values
// Example: Test layer with hard-coded responses

import { Arbitrary, Array, Context, Effect, Layer, Option, pipe } from "effect";
import * as fc from "effect/FastCheck";
import { User, type UserId } from "../_fixtures.js";

class UserApi extends Context.Tag("UserApi")<
	UserApi,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User>;
		readonly updateUser: (user: User) => Effect.Effect<void>;
	}
>() {}

// ✅ Good: Arbitrary-generated values for test layer
const UserApiTest = Layer.effect(
	UserApi,
	Effect.sync(() => {
		const UserArb = Arbitrary.make(User);
		return {
			getUser: (_id: UserId) =>
				Effect.succeed(
					pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow),
				),
			updateUser: (_user: User) => Effect.void,
		};
	}),
);

export { UserApiTest };
