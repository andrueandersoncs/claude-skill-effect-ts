// Rule: Never use 'as unknown as T'; define a Schema instead
// Example: Converting between types

import { Schema } from "effect"
import { RecordId } from "../_fixtures.js"

class NewFormat extends Schema.Class<NewFormat>("NewFormat")({
  id: RecordId,
  value: Schema.Number,
}) {}

// ✅ Good: Schema.decodeUnknown for type conversion
const convertLegacy = (legacyData: unknown) =>
  Schema.decodeUnknown(NewFormat)(legacyData)

export { convertLegacy }
