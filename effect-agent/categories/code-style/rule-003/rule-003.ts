// Rule: Never use eslint-disable for any-type errors; use Schema
// Example: Using Schema.decodeUnknown for type-safe parsing
// @rule-id: rule-003
// @category: code-style
// @original-name: eslint-disable-any-type

import { Effect, Schema } from "effect";

// GOOD: Use Schema.decodeUnknown instead of any
const JsonData = Schema.Struct({
	value: Schema.String,
	count: Schema.Number,
});

type JsonData = Schema.Schema.Type<typeof JsonData>;

// GOOD: Parse JSON with type-safe validation
export const parseJson = (input: string) =>
	Effect.gen(function* () {
		const parsed = JSON.parse(input);
		return yield* Schema.decodeUnknown(JsonData)(parsed);
	});

// GOOD: Safe property access with Schema validation
const ObjectWithValue = Schema.Struct({
	value: Schema.String,
});

export const getValue = (obj: unknown) =>
	Schema.decodeUnknownSync(ObjectWithValue)(obj).value;

// GOOD: Parse arrays with proper typing
const DataArray = Schema.Array(Schema.Unknown);

export const parseData = (input: string) =>
	Schema.decodeUnknownSync(DataArray)(JSON.parse(input));

// GOOD: Validate function signatures with Schema
const CallableSchema = Schema.declare(
	(input: unknown): input is () => void => typeof input === "function",
);

export const callSafe = (fn: unknown) =>
	Effect.gen(function* () {
		const validated = yield* Schema.decodeUnknown(CallableSchema)(fn);
		return validated();
	});
