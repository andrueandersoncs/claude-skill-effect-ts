// Rule: Never use catchAll for fallbacks; use Effect.orElse
// Example: Fallback to alternative (bad example)
// @rule-id: rule-008
// @category: errors
// @original-name: or-else-fallback

import { Effect } from "effect";

// Declare types and external functions
interface Data {
	id: string;
	value: string;
}

interface FetchError {
	readonly _tag: "FetchError";
}

declare function fetchFromPrimary(): Effect.Effect<Data, FetchError>;
declare function fetchFromBackup(): Effect.Effect<Data, FetchError>;

// ❌ Bad:
export const result = fetchFromPrimary().pipe(
	Effect.catchAll(() => fetchFromBackup()),
);
