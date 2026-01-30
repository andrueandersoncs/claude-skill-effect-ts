// Rule: Never use eslint-disable comments; fix the underlying issue
// Example: Unused variable warning
// @rule-id: rule-013
// @category: code-style
// @original-name: unused-variable

import { processResult, someFunction } from "../_fixtures.js";

// ✅ Good: Use the result instead of ignoring lint error
const result = someFunction();
const processed = processResult(result);

export { processed };
