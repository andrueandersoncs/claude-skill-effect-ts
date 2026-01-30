// Rule: Never access database directly; use a Context.Tag repository
// Example: Database operations (bad example)
// @rule-id: rule-003
// @category: services
// @original-name: context-tag-repository

import { Effect } from "effect";

interface User {
	id: string;
	name: string;
}

declare const db: {
	query: (sql: string, params: unknown[]) => Promise<unknown>;
};

// ❌ Bad: Direct database access without a Context.Tag repository service
const findUser = (id: string) =>
	Effect.tryPromise(() => db.query("SELECT * FROM users WHERE id = ?", [id]));

const saveUser = (user: User) =>
	Effect.tryPromise(() => db.query("INSERT INTO users VALUES (?)", [user]));

export { findUser, saveUser };
