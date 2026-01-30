// Rule: Never add TODO comments without actionable context; either fix it or remove it
// Example: TODO comments (bad example)
// @rule-id: rule-008
// @category: comments
// @original-name: todo-comments

import { Effect } from "effect";

type Data = unknown;

// ❌ Bad: Vague TODO with no context
// TODO: fix this
const processDataBad = (_data: Data) => Effect.void;

// ❌ Bad: Empty TODO
// TODO
const validateBad = Effect.void;

export { processDataBad, validateBad };
