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
	set: (key: string, value: unknown) => Effect.Effect<void>;
}

const Database = Context.GenericTag<DatabaseService>("Database");
const Cache = Context.GenericTag<CacheService>("Cache");

// ❌ Bad: Creating service implementation inline, mixing business logic with service creation
const program = Effect.gen(function* () {
	const db = yield* Database;
	const cache = yield* Cache;

	// Business logic mixed with service creation
	const user = yield* db.query("SELECT * FROM users WHERE id = 1");
	const userData = user as { id: string };
	yield* cache.set(userData.id, user);
	return user;
});

export { program };
