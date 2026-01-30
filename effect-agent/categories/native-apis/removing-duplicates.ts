// Rule: Never use [...new Set()]; use Array.dedupe
// Example: Removing duplicates

import { Array } from "effect";

declare const ids: ReadonlyArray<string>;

// ✅ Good: Array.dedupe for removing duplicates
const uniqueIds = Array.dedupe(ids);

export { uniqueIds };
