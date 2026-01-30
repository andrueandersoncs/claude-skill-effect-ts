// Rule: Never add TODO comments without actionable context; either fix it or remove it
// Example: TODO comments

import { Effect } from "effect"

type Data = unknown

// ❌ Bad: Vague TODO with no context
// TODO: fix this
const processDataBad = (_data: Data) => Effect.void

// ❌ Bad: Empty TODO
// TODO
const validateBad = Effect.void

// ✅ Good: Actionable TODO with ticket reference
// TODO(#123): Handle rate limiting when upstream API returns 429
const processData = (_data: Data) => Effect.void

export { processDataBad, validateBad, processData }
