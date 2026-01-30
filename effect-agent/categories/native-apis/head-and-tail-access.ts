// Rule: Never use array[index]; use Array.get or Array.head/last (returns Option)
// Example: Head and tail access

import { Array } from "effect";

declare const arr: ReadonlyArray<string>;

// ✅ Good: Array.head and Array.last return Option<A>
const first = Array.head(arr); // Option<string>
const last = Array.last(arr); // Option<string>

export { first, last };
