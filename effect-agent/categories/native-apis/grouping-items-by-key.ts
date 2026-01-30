// Rule: Never manually group with loops; use Array.groupBy
// Example: Grouping items by key

import { Array } from "effect";
import type { User } from "../_fixtures.js";

declare const users: ReadonlyArray<User>;

// ✅ Good: Array.groupBy returns Record<K, NonEmptyArray<A>>
const usersByRole = Array.groupBy(users, (u) => u.role ?? "user");

export { usersByRole };
