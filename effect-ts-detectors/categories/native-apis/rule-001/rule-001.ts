// Rule: Never nest two function calls; use Function.compose
// Example: Composing two functions
// @rule-id: rule-001
// @category: native-apis
// @original-name: composing-two-functions

import { Function } from "effect";

declare const parse: (input: string) => unknown;
declare const validate: (parsed: unknown) => boolean;

// ✅ Good: Function.compose for two functions
// parseAndValidate(input) = validate(parse(input))
const parseAndValidate = Function.compose(parse, validate);

export { parseAndValidate };
