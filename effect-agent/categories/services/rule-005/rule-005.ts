// Rule: Never create services inline; use Layer.effect or Layer.succeed
// Example: Service with dependencies
// @rule-id: rule-005
// @category: services
// @original-name: layer-effect

import { Context, Effect, Layer, Option } from "effect";
import {
	Cache,
	Database,
	type User,
	type UserId,
	type UserNotFound,
} from "../_fixtures.js";

// ✅ Good: Layer.effect for service with dependencies
class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
	}
>() {}

const UserServiceLive = Layer.effect(
	UserService,
	Effect.gen(function* () {
		const db = yield* Database;
		const cache = yield* Cache;

		return {
			getUser: (id: UserId) =>
				Effect.gen(function* () {
					const cached = yield* cache.get<User>(id);
					return yield* Option.match(Option.fromNullable(cached), {
						onSome: (user) => Effect.succeed(user),
						onNone: () =>
							Effect.gen(function* () {
								const user = yield* db.findUser(id);
								yield* cache.set(id, user);
								return user;
							}),
					});
				}),
		};
	}),
);

export { UserService, UserServiceLive };
