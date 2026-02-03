// Rule: Never suppress type errors with comments; fix the types
// Example: Fix type mismatches properly
// @rule-id: rule-009
// @category: code-style
// @original-name: fix-types

import { Effect, Schema } from "effect";

// Define a proper schema for validation
class User extends Schema.Class<User>("User")({
	id: Schema.String,
	name: Schema.NonEmptyString,
	email: Schema.String,
}) {}

const processUser = (user: User): Effect.Effect<void> =>
	Effect.log(`Processing user: ${user.name}`);

// GOOD: Validate unknown data with Schema instead of suppressing types
export const processUnknownData = (data: unknown) =>
	Effect.gen(function* () {
		// Properly validate and decode the unknown data
		const user = yield* Schema.decodeUnknown(User)(data);
		// Now we have a properly typed User
		yield* processUser(user);
	});

// GOOD: Use type guards to narrow types safely
const isUser = (value: unknown): value is User =>
	typeof value === "object" &&
	value !== null &&
	"id" in value &&
	"name" in value &&
	"email" in value &&
	typeof (value as User).id === "string" &&
	typeof (value as User).name === "string" &&
	typeof (value as User).email === "string";

export const processWithGuard = (data: unknown) =>
	Effect.gen(function* () {
		if (isUser(data)) {
			// Type is narrowed to User
			yield* processUser(data);
		} else {
			yield* Effect.fail(new Error("Invalid user data"));
		}
	});

// GOOD: Fix argument types by providing correct data
export const getUserName = (user: User): string => user.name;

export const correctUsage = () => {
	// Provide correctly typed data instead of suppressing errors
	const user = new User({
		id: "123",
		name: "Test User",
		email: "test@example.com",
	});
	return getUserName(user);
};
