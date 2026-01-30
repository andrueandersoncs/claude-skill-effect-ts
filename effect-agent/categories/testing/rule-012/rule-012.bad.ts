// Rule: Never use live services in tests; use layer() from @effect/vitest
// Example: Testing with service dependencies (bad example)
// @rule-id: rule-012
// @category: testing
// @original-name: layer-test

import { it } from "@effect/vitest";
import { Context, Effect, type Layer } from "effect";

// Declare external test function
declare function expect<T>(value: T): { toBeDefined(): void };

// Declare service interface
interface User {
	id: string;
	name: string;
}

interface UserRepository {
	readonly findById: (id: string) => Effect.Effect<User>;
}

const UserRepository = Context.GenericTag<UserRepository>("UserRepository");

// Declare the live layer (connects to real database)
declare const UserRepositoryLive: Layer.Layer<UserRepository>;

// BAD: Tests hit real database!
it.effect("should get user", () =>
	Effect.gen(function* () {
		const repo = yield* UserRepository;
		const user = yield* repo.findById("123");
		expect(user).toBeDefined();
	}).pipe(Effect.provide(UserRepositoryLive)),
);

export { UserRepository };
