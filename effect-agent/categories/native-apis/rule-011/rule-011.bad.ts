// Rule: Never use [...new Set()]; use Array.dedupe
// Example: Removing duplicates (bad example)
// @rule-id: rule-011
// @category: native-apis
// @original-name: removing-duplicates

// Declare external variables
declare const ids: string[];

// Bad: Using Set spread to remove duplicates instead of Array.dedupe
export const uniqueIds = [...new Set(ids)];
