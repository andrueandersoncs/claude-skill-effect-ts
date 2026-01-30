// Rule: Never use raw fc.integer/fc.string; use it.prop with Schema
// Example: Converting raw fast-check to Schema-based

import { expect, it } from "@effect/vitest";
import { Schema } from "effect";

// ✅ Good: it.prop accepts Schema types directly as arbitraries
it.prop(
	"should be commutative",
	{ a: Schema.Int, b: Schema.Int },
	({ a, b }) => {
		expect(a + b).toBe(b + a);
	},
);
