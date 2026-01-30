// Rule: Never use stateless test mocks; use Layer.effect with Ref for state
// Example: Repository test layer maintaining state (bad example)
// @rule-id: rule-007
// @category: services
// @original-name: stateful-test-layer

import { Context, Effect, Layer } from "effect";

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

// ❌ Bad: Stateless mock - can't test save then find
const UserRepositoryTest = Layer.succeed(UserRepository, {
	findById: (_id) => Effect.succeed({ id: _id, name: "Fixed" }),
	save: () => Effect.void,
});

export { UserRepositoryTest };
