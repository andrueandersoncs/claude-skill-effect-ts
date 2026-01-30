// Rule: Never use eslint-disable comments; fix the underlying issue
// Example: Unused variable warning

import { someFunction, processResult } from "../_fixtures.js"

// ✅ Good: Use the result instead of ignoring lint error
const result = someFunction()
const processed = processResult(result)

export { processed }
