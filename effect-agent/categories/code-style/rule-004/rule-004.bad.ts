// Rule: Never use Effect.gen for simple single-step effects; use Effect.fn()
// Example: Single operation function (bad example)
// @rule-id: rule-004
// @category: code-style
// @original-name: effect-fn-single-step

import { Effect } from "effect";

declare const fetchValue: (key: string) => Effect.Effect<string>;

// BAD: Using Effect.gen for a single-step operation
export const getConfig = (key: string) =>
	Effect.gen(function* () {
		return yield* fetchValue(key);
	});
