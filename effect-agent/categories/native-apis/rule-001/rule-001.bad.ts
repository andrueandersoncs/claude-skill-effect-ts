// Rule: Never nest two function calls; use Function.compose
// Example: Composing two functions (bad example)
// @rule-id: rule-001
// @category: native-apis
// @original-name: composing-two-functions

// Declare external functions
declare function parse(input: string): unknown;
declare function validate(data: unknown): boolean;

// Bad: Nested function calls instead of Function.compose
export const parseAndValidate = (input: string) => validate(parse(input));
