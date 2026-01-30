// Rule: Never use catchAll for fallbacks; use Effect.orElse
// Example: Fallback to alternative

import { Effect } from "effect";
import { fetchFromBackup, fetchFromPrimary } from "../_fixtures.js";

// ✅ Good: Effect.orElse for fallback
const result = fetchFromPrimary().pipe(Effect.orElse(() => fetchFromBackup()));

export { result };
