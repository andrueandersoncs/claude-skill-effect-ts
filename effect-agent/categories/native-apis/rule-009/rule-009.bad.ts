// Rule: Never use array[index]; use Array.get or Array.head/last (returns Option)
// Example: Head and tail access (bad example)
// @rule-id: rule-009
// @category: native-apis
// @original-name: head-and-tail-access

// Declare external variables
declare const arr: number[];

// Bad: Direct array index access instead of Array.head/Array.last
export const first = arr[0];
export const last = arr[arr.length - 1];
