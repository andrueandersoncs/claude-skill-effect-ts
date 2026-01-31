// Rule: Never use eslint-disable comments; fix the underlying issue
// Example: Unused variable warning
// @rule-id: rule-013
// @category: code-style
// @original-name: unused-variable

import { processResult, someFunction } from "../../_fixtures.js";

// GOOD: Use the result instead of ignoring lint error
const result = someFunction();
const processed = processResult(result);

// GOOD: Remove truly unused variables entirely
// (Don't declare variables you won't use)

// GOOD: Use underscore prefix for intentionally ignored values (destructuring)
const [firstItem, _ignored, thirdItem] = [1, 2, 3];

// GOOD: Export values that are part of the module's API
export { processed, firstItem, thirdItem };
