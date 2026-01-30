// Rule: Never use 'as any'; fix the type or create a Schema
// Example: Working with dynamic data
// @rule-id: rule-002
// @category: code-style
// @original-name: dynamic-data

import { Effect, Schema } from "effect";

class EventPayload extends Schema.Class<EventPayload>("EventPayload")({
	data: Schema.Unknown,
}) {}

class Event extends Schema.Class<Event>("Event")({
	payload: EventPayload,
}) {}

// ✅ Good: Schema.decodeUnknown for dynamic data
const processEvent = (event: unknown) =>
	Effect.gen(function* () {
		const typed = yield* Schema.decodeUnknown(Event)(event);
		return typed.payload.data;
	});

export { processEvent };
