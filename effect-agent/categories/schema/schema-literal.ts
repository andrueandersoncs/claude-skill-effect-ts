// Rule: Never use TypeScript enum; use Schema.Literal
// Example: Converting TypeScript enums

import { Schema } from "effect";

// ✅ Good: Schema.Literal for union of string values
const Status = Schema.Literal("pending", "active", "completed");
type Status = Schema.Schema.Type<typeof Status>;

// If you must use existing enum, wrap it
enum LegacyStatus {
	Pending = "pending",
	Active = "active",
}
const StatusFromEnum = Schema.Enums(LegacyStatus);

export { Status, StatusFromEnum };
