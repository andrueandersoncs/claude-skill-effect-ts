// Rule: Never use () => value; use Function.constant
// Example: Function that always returns same value

import { Function } from "effect"
import { defaultUser } from "../_fixtures.js"

// ✅ Good: Function.constant and Function.constVoid
const getDefaultUser = Function.constant(defaultUser)
const alwaysZero = Function.constant(0)
const noop = Function.constVoid

export { getDefaultUser, alwaysZero, noop }
