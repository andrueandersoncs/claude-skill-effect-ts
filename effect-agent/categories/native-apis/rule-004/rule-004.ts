// Rule: Never use native method chaining; use pipe with Effect's Array module
// Example: Data transformation pipeline
// @rule-id: rule-004
// @category: native-apis
// @original-name: data-transformation-pipeline

import { Array, pipe } from "effect";
import type { User } from "../_fixtures.js";

declare const users: ReadonlyArray<User>;

// ✅ Good: Consistent pipe with Effect's Array module
const result = pipe(
	users,
	Array.filter((u) => u.active === true),
	Array.map((u) => u.email),
	Array.take(10),
);

export { result };
