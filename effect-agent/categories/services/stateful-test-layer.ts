// Rule: Never use stateless test mocks; use Layer.effect with Ref for state
// Example: Repository test layer maintaining state

import { Context, Effect, HashMap, Layer, Option, pipe, Ref } from "effect";
import {
	type DatabaseError,
	type User,
	type UserId,
	UserNotFound,
} from "../_fixtures.js";

class UserRepository extends Context.Tag("UserRepository")<
	UserRepository,
	{
		readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
		readonly save: (user: User) => Effect.Effect<void, DatabaseError>;
		readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>;
	}
>() {}

// ✅ Good: Stateful test layer with Ref
const UserRepositoryTest = Layer.effect(
	UserRepository,
	Effect.gen(function* () {
		const store = yield* Ref.make(HashMap.empty<UserId, User>());

		return {
			findById: (id: UserId) =>
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

			save: (user: User) => Ref.update(store, HashMap.set(user.id, user)),

			delete: (id: UserId) => Ref.update(store, HashMap.remove(id)),
		};
	}),
);

export { UserRepository, UserRepositoryTest };
