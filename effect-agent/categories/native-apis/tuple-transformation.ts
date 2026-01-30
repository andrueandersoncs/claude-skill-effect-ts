// Rule: Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond
// Example: Tuple transformation

import { Tuple } from "effect"

declare const pair: readonly [string, number]

// ✅ Good: Tuple.mapBoth for tuple transformation
const transformed = Tuple.mapBoth(pair, {
  onFirst: (s) => s.toUpperCase(),
  onSecond: (n) => n * 2,
})

export { transformed }
