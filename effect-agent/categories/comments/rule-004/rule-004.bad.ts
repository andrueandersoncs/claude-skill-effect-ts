// Rule: Never add JSDoc @param/@returns that just repeat the type signature
// Example: Function documentation (bad example)
// @rule-id: rule-004
// @category: comments
// @original-name: function-documentation

import { Effect } from "effect";
import type { DatabaseError, Email, User } from "../../_fixtures.js";

// ❌ Bad: JSDoc that just restates type signature
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

export { createUserBad };
