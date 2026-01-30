// Rule: Never cast unknown to check ._tag; use Schema.is() for validation
// Example: Runtime validation of unknown input

import { Function, Match, Schema } from "effect";
import { Circle, Rectangle } from "../_fixtures.js";

// ✅ Good: Schema.is for runtime validation of unknown input
const handleUnknown = (input: unknown) =>
	Match.value(input).pipe(
		Match.when(
			Schema.is(Circle),
			(c) => `Valid circle with radius ${c.radius}`,
		),
		Match.when(
			Schema.is(Rectangle),
			(r) => `Valid rectangle ${r.width}x${r.height}`,
		),
		Match.orElse(Function.constant("Invalid shape")),
	);

export { handleUnknown };
