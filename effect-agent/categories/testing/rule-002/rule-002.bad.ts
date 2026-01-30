// Rule: Never hard-code values in test layers; use Arbitrary-generated values
// Example: Test layer with hard-coded responses (bad example)
// @rule-id: rule-002
// @category: testing
// @original-name: arbitrary-test-layer

import { Context, Effect, Layer } from "effect";

// Declare the service interface
interface User {
	id: string;
	name: string;
	email: string;
}

interface UserApi {
	readonly getUser: (id: string) => Effect.Effect<User, Error>;
	readonly updateUser: (user: User) => Effect.Effect<User, Error>;
}

const UserApi = Context.GenericTag<UserApi>("UserApi");

// BAD: Hard-coded response - same value every test run
export const UserApiTest = Layer.succeed(UserApi, {
	// Hard-coded response - same value every test run
	getUser: (_id) =>
		Effect.succeed({
			id: "test-123",
			name: "Test User",
			email: "test@test.com",
		}),
	// Not implemented - this code path won't be tested
	updateUser: () => Effect.fail(new Error("Not implemented")),
});
