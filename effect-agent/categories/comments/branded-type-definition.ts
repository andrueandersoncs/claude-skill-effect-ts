// Rule: Never add JSDoc comments that merely restate the type definition; the types are self-documenting
// Example: Branded type definition

import { Schema } from "effect";

// ❌ Bad: JSDoc comment that just restates the type
/** Branded type for operation IDs */
const OperationIdBad = Schema.String.pipe(Schema.brand("OperationId"));
type OperationIdBad = typeof OperationIdBad.Type;

// ✅ Good: Types are self-documenting
const OperationId = Schema.String.pipe(Schema.brand("OperationId"));
type OperationId = typeof OperationId.Type;

export { OperationIdBad, OperationId };
