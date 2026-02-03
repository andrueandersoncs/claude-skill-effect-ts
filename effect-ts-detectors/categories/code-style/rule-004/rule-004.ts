// Rule: Never use Effect.gen for simple single-step effects; use Effect.fn()
// Example: Single operation function
// @rule-id: rule-004
// @category: code-style
// @original-name: effect-fn-single-step

import { Config, Effect } from "effect";

// ✅ Good: Effect.fn for single-step operations
const getConfig = Effect.fn("getConfig")((key: string) => Config.string(key));

export { getConfig };
