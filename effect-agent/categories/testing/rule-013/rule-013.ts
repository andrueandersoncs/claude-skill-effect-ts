// Rule: Never write manual property tests; use it.effect.prop
// Example: Property test with Effect
// @rule-id: rule-013
// @category: testing
// @original-name: property-based

import { expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { Order, processOrder } from "../../_fixtures.js";

// ✅ Good: it.effect.prop handles property-based testing with Effect
it.effect.prop(
	"should process any valid order",
	{ order: Order }, // Schema used as arbitrary
	({ order }) =>
		Effect.gen(function* () {
			const result = yield* processOrder(order);
			expect(result.status).toBe("completed");
		}),
);
