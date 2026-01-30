// Rule: Never use eslint-disable comments; fix the underlying issue
// Example: Unused variable warning (bad example)
// @rule-id: rule-013
// @category: code-style
// @original-name: unused-variable

declare const someFunction: () => string;

// BAD: eslint-disable to suppress unused variable warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unusedValue = someFunction();

export const placeholder = true;
