// Rule: Never add inline comments for obvious Effect patterns; Effect code is self-documenting
// Example: Effect pipeline

import { Effect, pipe } from "effect";
import type {
	User,
	UserId,
	UserNotFound,
	ValidationError,
} from "../_fixtures.js";

declare const fetchUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
declare const validateUser: (
	user: User,
) => Effect.Effect<User, ValidationError>;
declare const transformUser: (user: User) => User;
declare const id: UserId;

// ❌ Bad: Inline comments for obvious operations
const resultBad = Effect.gen(function* () {
	return yield* pipe(
		fetchUser(id), // Get the user
		Effect.flatMap(validateUser), // Validate it
		Effect.map(transformUser), // Transform the result
	);
});

// ✅ Good: Effect patterns are self-explanatory
const result = Effect.gen(function* () {
	return yield* pipe(
		fetchUser(id),
		Effect.flatMap(validateUser),
		Effect.map(transformUser),
	);
});

export { resultBad, result };
