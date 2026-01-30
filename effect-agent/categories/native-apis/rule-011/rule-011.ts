// Rule: Never use [...new Set()]; use Array.dedupe
// Example: Removing duplicates
// @rule-id: rule-011
// @category: native-apis
// @original-name: removing-duplicates

import { Array } from "effect";

declare const ids: ReadonlyArray<string>;

// ✅ Good: Array.dedupe for removing duplicates
const uniqueIds = Array.dedupe(ids);

export { uniqueIds };
