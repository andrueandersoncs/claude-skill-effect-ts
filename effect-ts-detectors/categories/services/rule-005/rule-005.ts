// Rule: Never create services inline; use Layer.effect or Layer.succeed with proper Live/Test patterns
// Example: Comprehensive layer implementation patterns
// @rule-id: rule-005
// @category: services
// @original-name: layer-implementation

import {
	Array,
	Context,
	Effect,
	HashMap,
	Layer,
	Option,
	pipe,
	Ref,
} from "effect";
import {
	Cache,
	Database,
	type DatabaseError,
	type Email,
	sendRealEmail,
	type User,
	type UserId,
	UserNotFound,
} from "../../_fixtures.js";

// ============================================================================
// Pattern 1: Layer.effect for services with dependencies
// ============================================================================

class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
	}
>() {}

// Layer.effect when you need to access dependencies during layer creation
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

// ============================================================================
// Pattern 2: Live and Test layers (always create both)
// ============================================================================

interface EmailData {
	to: Email;
	subject: string;
	body: string;
}

class EmailService extends Context.Tag("EmailService")<
	EmailService,
	{
		readonly send: (email: EmailData) => Effect.Effect<void>;
		readonly getSentEmails: () => Effect.Effect<ReadonlyArray<EmailData>>;
	}
>() {}

// Live layer using Layer.succeed for simple services
const EmailServiceLive = Layer.succeed(EmailService, {
	send: (email) => sendRealEmail(email),
	getSentEmails: () => Effect.succeed([]),
});

// Test layer with state tracking using Ref
const EmailServiceTest = Layer.effect(
	EmailService,
	Effect.gen(function* () {
		const sentEmails = yield* Ref.make<ReadonlyArray<EmailData>>([]);

		return {
			send: (email: EmailData) => Ref.update(sentEmails, Array.append(email)),
			getSentEmails: () => Ref.get(sentEmails),
		};
	}),
);

// Example test usage
const testSendWelcomeEmail = (user: User) =>
	Effect.gen(function* () {
		const service = yield* EmailService;
		yield* service.send({
			to: user.email,
			subject: "Welcome",
			body: `Hello ${user.name}`,
		});
		const sent = yield* service.getSentEmails();
		const firstEmail = pipe(sent, Array.head, Option.getOrThrow);
		return firstEmail.to === user.email;
	});

// ============================================================================
// Pattern 3: Stateful test layer with Ref for repository pattern
// ============================================================================

class StatefulUserRepository extends Context.Tag("StatefulUserRepository")<
	StatefulUserRepository,
	{
		readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
		readonly save: (user: User) => Effect.Effect<void, DatabaseError>;
		readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>;
	}
>() {}

// Stateful test layer using HashMap and Ref for in-memory storage
const StatefulUserRepositoryTest = Layer.effect(
	StatefulUserRepository,
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

export {
	UserService,
	UserServiceLive,
	EmailService,
	EmailServiceLive,
	EmailServiceTest,
	testSendWelcomeEmail,
	StatefulUserRepository,
	StatefulUserRepositoryTest,
};
