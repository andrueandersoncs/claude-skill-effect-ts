// Rule: Never check error._tag manually; use Effect.catchTag
// Example: Recovering from specific errors (bad example)
// @rule-id: rule-002
// @category: errors
// @original-name: catch-tag

import { Effect } from "effect";

// Declare types and external functions
interface User {
	id: string;
	name: string;
}

interface UserNotFoundError {
	readonly _tag: "UserNotFound";
}

interface DatabaseError {
	readonly _tag: "DatabaseError";
}

type UserError = UserNotFoundError | DatabaseError;

declare function getUser(id: string): Effect.Effect<User, UserError>;

declare const defaultUser: User;

// ❌ Bad:
export const getUserWithFallback = (id: string) =>
	getUser(id).pipe(
		Effect.catchAll((error) => {
			if (error._tag === "UserNotFound") {
				return Effect.succeed(defaultUser);
			}
			return Effect.fail(error);
		}),
	);
