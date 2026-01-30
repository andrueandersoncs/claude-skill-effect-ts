// Rule: Never stub methods as "not implemented"; use Arbitrary-generated responses
// Example: Anti-pattern: stubbing methods as not implemented (bad example)
// @rule-id: rule-001
// @category: testing
// @original-name: arbitrary-responses

import { Context, Effect, Layer } from "effect";

// Declare the service interface
interface User {
	id: string;
	name: string;
}

interface MyService {
	readonly getUser: (id: string) => Effect.Effect<User, Error>;
	readonly updateUser: (user: User) => Effect.Effect<User, Error>;
	readonly deleteUser: (id: string) => Effect.Effect<void, Error>;
}

const MyService = Context.GenericTag<MyService>("MyService");

// BAD: Stubbing methods as "not implemented"
export const TestLayer = Layer.succeed(MyService, {
	getUser: (id) => Effect.succeed({ id, name: "Hardcoded" }),
	updateUser: () => Effect.fail(new Error("Not implemented")), // Won't test this path!
	deleteUser: () => Effect.fail(new Error("Not implemented")),
});
