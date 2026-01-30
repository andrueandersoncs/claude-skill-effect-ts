// Rule: Never chain filter then map; use Array.filterMap in one pass
// Example: Filter and transform in single pass

import { Array, Match, Option } from "effect";
import { isValidEmail, type User } from "../_fixtures.js";

declare const users: ReadonlyArray<User>;

// ✅ Good: Array.filterMap for filter + map in one pass
const validEmails = Array.filterMap(users, (u) =>
	Match.value(isValidEmail(u.email)).pipe(
		Match.when(true, () => Option.some(u.email)),
		Match.orElse(Option.none),
	),
);

export { validEmails };
