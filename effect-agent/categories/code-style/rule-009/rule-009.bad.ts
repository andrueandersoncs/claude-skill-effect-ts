// Rule: Never suppress type errors with comments; fix the types
// Example: Type mismatch error (bad example)
// @rule-id: rule-009
// @category: code-style
// @original-name: fix-types

declare const data: unknown;
declare const incompatibleFunction: (x: string) => string;

// BAD: @ts-expect-error to suppress type errors
// @ts-expect-error - TODO fix types later
export const result = incompatibleFunction(data);
