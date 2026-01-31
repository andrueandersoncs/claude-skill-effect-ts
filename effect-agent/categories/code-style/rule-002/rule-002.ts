// Rule: Never use type assertions (as, angle brackets, double assertions); use Schema.decodeUnknown or type guards
// Example: Working with dynamic data, DOM elements, type conversion, API responses
// @rule-id: rule-002
// @category: code-style
// @original-name: no-type-assertions

import { Effect, Option, pipe, Schema } from "effect";
import {
	ElementNotFound,
	FetchError,
	RecordId,
	User,
	type UserId,
} from "../../_fixtures.js";

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

// ✅ Good: Option and type guard for DOM elements (instead of angle bracket casting)
const getInput = (id: string) =>
	Effect.gen(function* () {
		const el = yield* Effect.sync(() => document.getElementById(id));
		return yield* pipe(
			Option.fromNullable(el),
			Option.filter(
				(e): e is HTMLInputElement => e instanceof HTMLInputElement,
			),
			Option.match({
				onNone: () => Effect.fail(new ElementNotFound({ id })),
				onSome: Effect.succeed,
			}),
		);
	});

class NewFormat extends Schema.Class<NewFormat>("NewFormat")({
	id: RecordId,
	value: Schema.Number,
}) {}

// ✅ Good: Schema.decodeUnknown for type conversion (instead of double assertion)
const convertLegacy = (legacyData: unknown) =>
	Schema.decodeUnknown(NewFormat)(legacyData);

// ✅ Good: Schema.decodeUnknown for runtime validation of API responses
const fetchUser = (id: UserId) =>
	Effect.gen(function* () {
		const response = yield* Effect.tryPromise({
			try: () => fetch(`/users/${id}`),
			catch: (e) => new FetchError({ cause: e }),
		});
		const json = yield* Effect.tryPromise({
			try: () => response.json(),
			catch: (e) => new FetchError({ cause: e }),
		});
		return yield* Schema.decodeUnknown(User)(json);
	});

export { convertLegacy, fetchUser, getInput, processEvent };
