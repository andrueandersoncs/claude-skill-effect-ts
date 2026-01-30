// Rule: Never add JSDoc comments that merely restate the type definition; the types are self-documenting
// Example: Branded type definition (bad example)
// @rule-id: rule-001
// @category: comments
// @original-name: branded-type-definition

import { Schema } from "effect";

// ❌ Bad: JSDoc comment that just restates the type
/** Branded type for operation IDs */
const OperationIdBad = Schema.String.pipe(Schema.brand("OperationId"));
type OperationIdBad = typeof OperationIdBad.Type;

export { OperationIdBad };
