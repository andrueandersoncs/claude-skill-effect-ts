// Rule: Never create services inline; use Layer.effect or Layer.succeed with proper Live/Test patterns
// Example: Comprehensive layer implementation patterns (bad examples)
// @rule-id: rule-005
// @category: services
// @original-name: layer-implementation

import { Context, Effect, Layer } from "effect";

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

// ============================================================================
// Anti-pattern 1: Creating service implementation inline without Layer.effect
// ============================================================================

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

// ============================================================================
// Anti-pattern 2: Only has live implementation, no test layer
// ============================================================================

interface Email {
	to: string;
	subject: string;
	body: string;
}

interface EmailServiceType {
	send: (email: Email) => Effect.Effect<void>;
}

const EmailService = Context.GenericTag<EmailServiceType>("EmailService");

declare const sendRealEmail: (email: Email) => Effect.Effect<void>;
declare const user: { email: string; name: string };
declare const sendWelcomeEmail: (user: {
	email: string;
	name: string;
}) => Effect.Effect<void, never, EmailServiceType>;

// Only has live implementation, no test layer
const EmailServiceLive = Layer.succeed(EmailService, {
	send: (email) => sendRealEmail(email),
});

// Tests hit real email service!
const testBad = () =>
	Effect.gen(function* () {
		yield* sendWelcomeEmail(user);
	}).pipe(Effect.provide(EmailServiceLive));

// ============================================================================
// Anti-pattern 3: Stateless mock - can't test save then find
// ============================================================================

interface User {
	id: string;
	name: string;
}

interface UserRepositoryService {
	findById: (id: string) => Effect.Effect<User | undefined>;
	save: (user: User) => Effect.Effect<void>;
}

const UserRepository =
	Context.GenericTag<UserRepositoryService>("UserRepository");

// Stateless mock - can't test save then find
const UserRepositoryTest = Layer.succeed(UserRepository, {
	findById: (_id) => Effect.succeed({ id: _id, name: "Fixed" }),
	save: () => Effect.void,
});

export {
	UserService,
	UserServiceBadLayer,
	EmailServiceLive,
	testBad,
	UserRepositoryTest,
};
