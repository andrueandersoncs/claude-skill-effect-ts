// Rule: Never use live services in tests; use layer() from @effect/vitest
// Example: Testing with service dependencies
// @rule-id: rule-012
// @category: testing
// @original-name: layer-test

import { expect, layer } from "@effect/vitest";
import { Context, Effect, HashMap, Layer, Option, pipe, Ref } from "effect";
import { User, type UserId, UserNotFound } from "../_fixtures.js";

// Service definition
class UserRepository extends Context.Tag("UserRepository")<
	UserRepository,
	{
		readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
		readonly save: (user: User) => Effect.Effect<void>;
	}
>() {}

// Test layer with in-memory store using HashMap
const UserRepositoryTest = Layer.effect(
	UserRepository,
	Effect.gen(function* () {
		const store = yield* Ref.make(HashMap.empty<UserId, User>());
		return {
			findById: (id) =>
				Ref.get(store).pipe(
					Effect.flatMap((users) =>
						pipe(
							HashMap.get(users, id),
							Option.match({
								onNone: () => Effect.fail(new UserNotFound({ userId: id })),
								onSome: Effect.succeed,
							}),
						),
					),
				),
			save: (user) => Ref.update(store, HashMap.set(user.id, user)),
		};
	}),
);

// ✅ Good: layer() shares the test layer and wraps tests in describe block
layer(UserRepositoryTest)("UserService", (it) => {
	it.effect.prop("should save and find any user", { user: User }, ({ user }) =>
		Effect.gen(function* () {
			const repo = yield* UserRepository;
			yield* repo.save(user);
			const found = yield* repo.findById(user.id);
			expect(found).toEqual(user);
		}),
	);
});
