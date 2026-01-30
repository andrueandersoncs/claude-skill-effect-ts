// Rule: Never use Effect.gen for simple single-step effects; use Effect.fn()
// Example: Single operation function

import { Config, Effect } from "effect"

// ✅ Good: Effect.fn for single-step operations
const getConfig = Effect.fn("getConfig")((key: string) => Config.string(key))

export { getConfig }
