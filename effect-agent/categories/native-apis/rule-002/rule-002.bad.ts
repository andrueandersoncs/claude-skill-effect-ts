// Rule: Never use (x) => x; use Function.identity
// Example: Conditional transformation (bad example)
// @rule-id: rule-002
// @category: native-apis
// @original-name: conditional-transformation

// Declare external functions/variables
declare const shouldTransform: boolean;
declare function myTransform<T>(x: T): T;

// Bad: Anonymous identity function instead of Function.identity
export const transform = shouldTransform ? myTransform : <T>(x: T): T => x;
