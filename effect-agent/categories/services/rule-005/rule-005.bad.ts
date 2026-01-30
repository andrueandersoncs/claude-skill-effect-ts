// Rule: Never create services inline; use Layer.effect or Layer.succeed
// Example: Service with dependencies (bad example)
// @rule-id: rule-005
// @category: services
// @original-name: layer-effect

import { Context, Effect } from "effect";

interface DatabaseService {
	query: (sql: string) => Effect.Effect<unknown>;
}
interface CacheService {
	get: <T>(key: string) => Effect.Effect<T | null>;
	set: (key: string, value: unknown) => Effect.Effect<void>;
}

const Database = Context.GenericTag<DatabaseService>("Database");
const Cache = Context.GenericTag<CacheService>("Cache");

// Define a UserService tag
class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: string) => Effect.Effect<unknown>;
	}
>() {}

// ❌ Bad: Creating service implementation inline without Layer.effect
// Should use: Layer.effect(UserService, Effect.gen(...))
const UserServiceBadLayer = Effect.gen(function* () {
	const db = yield* Database;
	const cache = yield* Cache;

	// This creates a service object inline - should be wrapped in Layer.effect
	return {
		getUser: (id: string) =>
			Effect.gen(function* () {
				const cached = yield* cache.get<unknown>(id);
				if (cached) return cached;
				const user = yield* db.query(`SELECT * FROM users WHERE id = '${id}'`);
				yield* cache.set(id, user);
				return user;
			}),
	};
});

export { UserService, UserServiceBadLayer };
