// Rule: Never call external dependencies directly; always wrap them in a Context.Tag service
// Example: HTTP APIs, Filesystem, Repositories, Third-party SDKs (bad examples)
// @rule-id: rule-001
// @category: services
// @original-name: context-tag-dependencies

import * as fs from "node:fs/promises";
import { Effect } from "effect";

declare const processData: (user: unknown) => unknown;

// ============================================================================
// 1. Bad: Direct HTTP API call
// ============================================================================

// Direct API call without using a Context.Tag service
const getUser = (id: string) =>
	Effect.tryPromise(() =>
		fetch(`https://api.example.com/users/${id}`).then((r) => r.json()),
	);

// Used directly in business logic - untestable!
const processUser = (id: string) =>
	Effect.gen(function* () {
		const user = yield* getUser(id); // Direct API call - can't mock in tests
		return processData(user);
	});

// ============================================================================
// 2. Bad: Direct filesystem access
// ============================================================================

// Direct file system access without a Context.Tag service
const readConfig = () =>
	Effect.tryPromise(() => fs.readFile("config.json", "utf-8"));

const writeLog = (message: string) =>
	Effect.tryPromise(() => fs.appendFile("app.log", message));

// ============================================================================
// 3. Bad: Direct database access
// ============================================================================

interface User {
	id: string;
	name: string;
}

declare const db: {
	query: (sql: string, params: unknown[]) => Promise<unknown>;
};

// Direct database access without a Context.Tag repository service
const findUser = (id: string) =>
	Effect.tryPromise(() => db.query("SELECT * FROM users WHERE id = ?", [id]));

const saveUser = (user: User) =>
	Effect.tryPromise(() => db.query("INSERT INTO users VALUES (?)", [user]));

// ============================================================================
// 4. Bad: Direct third-party SDK call
// ============================================================================

interface StripeClient {
	charges: {
		create: (params: {
			amount: number;
			currency: string;
		}) => Promise<{ id: string }>;
	};
}

declare const Stripe: new (key: string | undefined) => StripeClient;

const stripe = new Stripe(process.env["STRIPE_KEY"]);

// Direct SDK call in business logic - untestable!
const processPayment = (amount: number) =>
	Effect.tryPromise(() => stripe.charges.create({ amount, currency: "usd" }));

export {
	getUser,
	processUser,
	readConfig,
	writeLog,
	findUser,
	saveUser,
	processPayment,
};
