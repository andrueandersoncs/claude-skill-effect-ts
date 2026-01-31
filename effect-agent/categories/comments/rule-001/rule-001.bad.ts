// Rule: Never add comments that merely restate what the code already expresses; Effect-TS code is self-documenting
// Example: Self-documenting code patterns (bad examples)
// @rule-id: rule-001
// @category: comments
// @original-name: self-documenting-code

import { Effect, pipe, Schema } from "effect";
import {
	Database,
	type DatabaseError,
	type Email,
	type User,
	type UserId,
	type UserNotFound,
	type ValidationError,
} from "../../_fixtures.js";

// Bad: JSDoc comment that just restates the type
/** Branded type for operation IDs */
const OperationIdBad = Schema.String.pipe(Schema.brand("OperationId"));
type OperationIdBad = typeof OperationIdBad.Type;

declare const fetchUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
declare const validateUser: (
	user: User,
) => Effect.Effect<User, ValidationError>;
declare const transformUser: (user: User) => User;
declare const id: UserId;

// Bad: Inline comments for obvious operations
const resultBad = Effect.gen(function* () {
	return yield* pipe(
		fetchUser(id), // Get the user
		Effect.flatMap(validateUser), // Validate it
		Effect.map(transformUser), // Transform the result
	);
});

// Bad: JSDoc that just restates type signature
/**
 * Creates a user.
 * @param name - The name of the user
 * @param email - The email of the user
 * @returns The created user
 */
const createUserBad = (
	_name: string,
	_email: Email,
): Effect.Effect<User, DatabaseError> => Effect.die("Not implemented");

// Bad: Comment describes what the code does
// Get the user from the database
const getUserBad = (userId: UserId) =>
	Effect.gen(function* () {
		const db = yield* Database;
		return yield* db.findUser(userId);
	});

export { OperationIdBad, resultBad, createUserBad, getUserBad };
