// Rule: Never use eslint-disable comments; fix the underlying issue
// Example: Unused variable warning (bad example)
// @rule-id: rule-013
// @category: code-style
// @original-name: unused-variable

declare const someFunction: () => string;
declare const anotherFunction: () => number;

// BAD: Using eslint-disable to suppress unused variable warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedResult = someFunction();

// BAD: Using eslint-disable-line to suppress warning
const anotherUnused = anotherFunction(); // eslint-disable-line no-unused-vars

// BAD: Block disable for unused vars
/* eslint-disable @typescript-eslint/no-unused-vars */
const ignoredValue = "this is never used";
const anotherIgnored = 42;
/* eslint-enable @typescript-eslint/no-unused-vars */

export const placeholder = true;
