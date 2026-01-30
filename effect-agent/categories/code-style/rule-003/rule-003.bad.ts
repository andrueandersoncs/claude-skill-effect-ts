// Rule: Never use eslint-disable for any-type errors; use Schema
// Example: Dynamic property access (bad example)
// @rule-id: rule-003
// @category: code-style
// @original-name: dynamic-property-access

// BAD: eslint-disable to allow 'any' type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValue = (obj: any, key: string): unknown => obj[key];
