// Rule: Never use Schema.Any/Schema.Unknown unless genuinely unconstrained
// Example: Legitimate use of Schema.Unknown (exception cause) (bad example)
// @rule-id: rule-012
// @category: schema
// @original-name: schema-unknown-legitimate

import { Schema } from "effect";

// ❌ Bad: Overusing Schema.Unknown when payload should be typed
const Event = Schema.Struct({
	type: Schema.String,
	payload: Schema.Unknown, // Should be typed
});

type Event = Schema.Schema.Type<typeof Event>;

// Usage demonstrating the problem
export function handleEventBad(event: Event) {
	// Have to cast payload because it's unknown
	const payload = event.payload as { userId: string };
	return payload.userId;
}

export { Event };
