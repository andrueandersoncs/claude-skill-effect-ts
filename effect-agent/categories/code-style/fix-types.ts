// Rule: Never suppress type errors with comments; fix the types
// Example: Type mismatch error

import { Effect, Schema } from "effect";
import { compatibleFunction } from "../_fixtures.js";

class Input extends Schema.Class<Input>("Input")({
	data: Schema.String,
}) {}

// ✅ Good: Validate with Schema instead of suppressing types
const result = (data: unknown) =>
	Effect.gen(function* () {
		const validated = yield* Schema.decodeUnknown(Input)(data);
		return yield* compatibleFunction(validated);
	});

export { result };
