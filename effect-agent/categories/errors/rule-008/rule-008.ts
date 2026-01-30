// Rule: Never use catchAll for fallbacks; use Effect.orElse
// Example: Fallback to alternative
// @rule-id: rule-008
// @category: errors
// @original-name: or-else-fallback

import { Effect } from "effect";
import { fetchFromBackup, fetchFromPrimary } from "../_fixtures.js";

// ✅ Good: Effect.orElse for fallback
const result = fetchFromPrimary().pipe(Effect.orElse(() => fetchFromBackup()));

export { result };
