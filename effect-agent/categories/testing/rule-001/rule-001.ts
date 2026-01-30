// Rule: Never stub methods as "not implemented"; use Arbitrary-generated responses
// Example: Anti-pattern: stubbing methods as not implemented
// @rule-id: rule-001
// @category: testing
// @original-name: arbitrary-responses

import { Arbitrary, Array, Context, Effect, Layer, Option, pipe } from "effect";
import * as fc from "effect/FastCheck";
import { User, type UserId } from "../../_fixtures.js";

class MyService extends Context.Tag("MyService")<
	MyService,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User>;
		readonly updateUser: (user: User) => Effect.Effect<void>;
		readonly deleteUser: (id: UserId) => Effect.Effect<void>;
	}
>() {}

// ✅ Good: Generate valid responses so all code paths can be exercised
const TestLayer = Layer.effect(
	MyService,
	Effect.sync(() => {
		const UserArb = Arbitrary.make(User);
		return {
			getUser: (_id: UserId) =>
				Effect.succeed(
					pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow),
				),
			updateUser: (_user: User) => Effect.void,
			deleteUser: (_id: UserId) => Effect.void,
		};
	}),
);

export { TestLayer };
