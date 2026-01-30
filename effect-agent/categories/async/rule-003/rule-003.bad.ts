// Rule: Never use Effect.runPromise except at application boundaries
// Example: Using runPromise in a service/utility (NOT at boundary - BAD)
// @rule-id: rule-003
// @category: async
// @original-name: http-handler-boundary

import { Effect } from "effect";

// Mock types
interface User {
	id: string;
	name: string;
}

declare const fetchUserFromDb: (id: string) => Effect.Effect<User, Error>;

// ❌ Bad: Using Effect.runPromise inside a utility/service function
// This breaks Effect composition - callers can't compose this with other Effects
export async function getUserById(id: string): Promise<User> {
	// BAD: Running Effect in the middle of the application
	// This should return Effect.Effect<User, Error> instead
	return Effect.runPromise(fetchUserFromDb(id));
}

// ❌ Bad: Using Effect.runSync in a helper function
export function getConfigValue(key: string): string {
	const config = Effect.succeed({ apiUrl: "https://api.example.com" });
	// BAD: Running Effect synchronously in utility
	return Effect.runSync(Effect.map(config, (c) => c.apiUrl));
}

// ❌ Bad: Breaking Effect composition with runPromise mid-flow
export const processUser = async (id: string) => {
	// BAD: This should be Effect.flatMap instead
	const user = await Effect.runPromise(fetchUserFromDb(id));
	return { processed: true, user };
};
