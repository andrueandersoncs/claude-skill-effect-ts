// Rule: Never call external dependencies directly; always wrap them in a Context.Tag service
// Example: HTTP APIs, Filesystem, Repositories, Third-party SDKs
// @rule-id: rule-001
// @category: services
// @original-name: context-tag-dependencies

import * as fs from "node:fs/promises";
import {
	Arbitrary,
	Array,
	Config,
	Context,
	Effect,
	Function,
	HashMap,
	Layer,
	Option,
	pipe,
	Ref,
	Schema,
} from "effect";
import * as fc from "effect/FastCheck";
import {
	ApiError,
	type ChargeId,
	ChargeResult,
	Database,
	DatabaseError,
	Email,
	FileError,
	PaymentError,
	RefundError,
	User,
	type UserId,
	UserNotFound,
} from "../../_fixtures.js";

// ============================================================================
// 1. HTTP API Service
// ============================================================================

// Good: Context.Tag service for external API
class UserApi extends Context.Tag("UserApi")<
	UserApi,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User, ApiError>;
		readonly updateUser: (user: User) => Effect.Effect<void, ApiError>;
	}
>() {}

const processUser = (id: UserId) =>
	Effect.gen(function* () {
		const api = yield* UserApi;
		const user = yield* api.getUser(id);
		return user;
	});

// Live layer implementation
const UserApiLive = Layer.succeed(UserApi, {
	getUser: (id) =>
		Effect.gen(function* () {
			const url = `https://api.example.com/users/${id}`;
			const response = yield* Effect.tryPromise({
				try: () => fetch(url),
				catch: (e) => new ApiError({ url, cause: e }),
			});
			const json = yield* Effect.tryPromise({
				try: () => response.json(),
				catch: (e) => new ApiError({ url, cause: e }),
			});
			return yield* Schema.decodeUnknown(User)(json).pipe(
				Effect.mapError((e) => new ApiError({ url, cause: e })),
			);
		}),
	updateUser: (user) =>
		Effect.gen(function* () {
			const url = `https://api.example.com/users/${user.id}`;
			const response = yield* Effect.tryPromise({
				try: () =>
					fetch(url, {
						method: "PUT",
						body: JSON.stringify(user),
					}),
				catch: (e) => new ApiError({ url, cause: e }),
			});
			yield* Effect.tryPromise({
				try: () => response.json(),
				catch: (e) => new ApiError({ url, cause: e }),
			});
		}),
});

// Test layer implementation with Arbitrary
const UserApiTest = Layer.effect(
	UserApi,
	Effect.gen(function* () {
		const UserArb = Arbitrary.make(User);
		return {
			getUser: (_id: UserId): Effect.Effect<User, ApiError> =>
				pipe(
					Effect.sync(() => fc.sample(UserArb, 1)),
					Effect.flatMap((samples) =>
						pipe(
							Array.head(samples),
							Option.match({
								onNone: () => Effect.die("Failed to generate arbitrary user"),
								onSome: Effect.succeed,
							}),
						),
					),
				),
			updateUser: (_user: User): Effect.Effect<void, ApiError> => Effect.void,
		};
	}),
);

// ============================================================================
// 2. Filesystem Service
// ============================================================================

// Good: Context.Tag service for file system
class FileSystem extends Context.Tag("FileSystem")<
	FileSystem,
	{
		readonly readFile: (path: string) => Effect.Effect<string, FileError>;
		readonly writeFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly appendFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly exists: (path: string) => Effect.Effect<boolean>;
	}
>() {}

// Live layer implementation
const FileSystemLive = Layer.succeed(FileSystem, {
	readFile: (path) =>
		Effect.tryPromise({
			try: () => fs.readFile(path, "utf-8"),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	writeFile: (path, content) =>
		Effect.tryPromise({
			try: () => fs.writeFile(path, content),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	appendFile: (path, content) =>
		Effect.tryPromise({
			try: () => fs.appendFile(path, content),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	exists: (path) =>
		Effect.tryPromise({
			try: () => fs.access(path),
			catch: Function.identity,
		}).pipe(
			Effect.as(true),
			Effect.orElse(Function.constant(Effect.succeed(false))),
		),
});

// Test layer implementation with in-memory store
const FileSystemTest = Layer.effect(
	FileSystem,
	Effect.gen(function* () {
		const store = yield* Ref.make(HashMap.empty<string, string>());

		return {
			readFile: (path: string) =>
				Ref.get(store).pipe(
					Effect.flatMap((files) =>
						pipe(
							HashMap.get(files, path),
							Option.match({
								onNone: () =>
									Effect.fail(new FileError({ path, cause: "Not found" })),
								onSome: Effect.succeed,
							}),
						),
					),
				),
			writeFile: (path: string, content: string) =>
				Ref.update(store, HashMap.set(path, content)),
			appendFile: (path: string, content: string) =>
				Ref.update(store, (files) =>
					pipe(
						HashMap.get(files, path),
						Option.getOrElse(Function.constant("")),
						(existing) => HashMap.set(files, path, existing + content),
					),
				),
			exists: (path: string) =>
				Ref.get(store).pipe(Effect.map(HashMap.has(path))),
		};
	}),
);

// ============================================================================
// 3. Repository Service
// ============================================================================

class UserNotFoundByEmail extends Schema.TaggedError<UserNotFoundByEmail>()(
	"UserNotFoundByEmail",
	{ email: Email },
) {}

// Good: Context.Tag repository for database access
class UserRepository extends Context.Tag("UserRepository")<
	UserRepository,
	{
		readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
		readonly findByEmail: (
			email: Email,
		) => Effect.Effect<User, UserNotFoundByEmail>;
		readonly save: (user: User) => Effect.Effect<void, DatabaseError>;
		readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>;
	}
>() {}

// Live layer implementation
const UserRepositoryLive = Layer.effect(
	UserRepository,
	Effect.gen(function* () {
		const db = yield* Database;
		return {
			findById: (id) =>
				db
					.query<User>("SELECT * FROM users WHERE id = ?", [id])
					.pipe(Effect.mapError(() => new UserNotFound({ userId: id }))),
			findByEmail: (email) =>
				db
					.query<User>("SELECT * FROM users WHERE email = ?", [email])
					.pipe(Effect.mapError(() => new UserNotFoundByEmail({ email }))),
			save: (user) =>
				db.query("INSERT INTO users VALUES (?)", [user]).pipe(
					Effect.asVoid,
					Effect.mapError((e) => new DatabaseError({ cause: e })),
				),
			delete: (id) =>
				db.query("DELETE FROM users WHERE id = ?", [id]).pipe(
					Effect.asVoid,
					Effect.mapError((e) => new DatabaseError({ cause: e })),
				),
		};
	}),
);

// Test layer implementation with in-memory store
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
			findByEmail: (email: Email) =>
				Ref.get(store).pipe(
					Effect.flatMap((users) =>
						pipe(
							HashMap.values(users),
							Array.fromIterable,
							Array.findFirst((u) => u.email === email),
							Option.match({
								onNone: () => Effect.fail(new UserNotFoundByEmail({ email })),
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

// ============================================================================
// 4. Third-Party SDK Service (Payment Gateway)
// ============================================================================

// Stripe SDK stub
interface Stripe {
	charges: {
		create: (params: { amount: number; currency: string }) => Promise<{
			id: string;
			amount: number;
			currency: string;
			status: string;
		}>;
	};
	refunds: {
		create: (params: { charge: string }) => Promise<unknown>;
	};
}
declare const StripeConstructor: new (key: string) => Stripe;

// Good: Context.Tag service for third-party SDK
class PaymentGateway extends Context.Tag("PaymentGateway")<
	PaymentGateway,
	{
		readonly charge: (
			amount: number,
			currency: string,
		) => Effect.Effect<ChargeResult, PaymentError>;
		readonly refund: (chargeId: ChargeId) => Effect.Effect<void, RefundError>;
	}
>() {}

// Live layer
const PaymentGatewayLive = Layer.effect(
	PaymentGateway,
	Effect.gen(function* () {
		const config = yield* Config.string("STRIPE_KEY");
		const stripe = new StripeConstructor(config);

		return {
			charge: (amount, currency) =>
				Effect.gen(function* () {
					const response = yield* Effect.tryPromise({
						try: () => stripe.charges.create({ amount, currency }),
						catch: (e) => new PaymentError({ cause: e }),
					});
					return yield* Schema.decodeUnknown(ChargeResult)(response).pipe(
						Effect.mapError((e) => new PaymentError({ cause: e })),
					);
				}),
			refund: (chargeId) =>
				Effect.tryPromise({
					try: () => stripe.refunds.create({ charge: chargeId }),
					catch: (e) => new RefundError({ cause: e }),
				}).pipe(Effect.asVoid),
		};
	}),
);

// Test layer
const PaymentGatewayTest = Layer.effect(
	PaymentGateway,
	Effect.sync(() => {
		const ChargeResultArb = Arbitrary.make(ChargeResult);
		return {
			charge: (
				_amount: number,
				_currency: string,
			): Effect.Effect<ChargeResult, PaymentError> =>
				Effect.succeed(
					pipe(fc.sample(ChargeResultArb, 1), Array.head, Option.getOrThrow),
				),
			refund: (_chargeId: ChargeId): Effect.Effect<void, RefundError> =>
				Effect.void,
		};
	}),
);

// Usage example
const processPayment = (amount: number) =>
	Effect.gen(function* () {
		const gateway = yield* PaymentGateway;
		return yield* gateway.charge(amount, "usd");
	});

export {
	// API Service
	UserApi,
	processUser,
	UserApiLive,
	UserApiTest,
	// Filesystem Service
	FileSystem,
	FileSystemLive,
	FileSystemTest,
	// Repository Service
	UserRepository,
	UserRepositoryLive,
	UserRepositoryTest,
	// Payment Gateway Service
	PaymentGateway,
	PaymentGatewayLive,
	PaymentGatewayTest,
	processPayment,
};
