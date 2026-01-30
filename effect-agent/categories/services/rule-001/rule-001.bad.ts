// Rule: Never call external APIs directly; use a Context.Tag service
// Example: HTTP API call (bad example)
// @rule-id: rule-001
// @category: services
// @original-name: context-tag-api

import { Effect } from "effect";

declare const processData: (user: unknown) => unknown;

// ❌ Bad: Direct API call without using a Context.Tag service
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

export { getUser, processUser };
