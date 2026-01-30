// Rule: Never use JSON.parse(); use Schema.parseJson()
// Example: Separate JSON.parse then validate (WRONG)

import { Schema } from "effect";

class MyData extends Schema.Class<MyData>("MyData")({
	name: Schema.NonEmptyString,
	count: Schema.Number,
}) {}

// ✅ Good: Schema.parseJson combines parsing and validation
const MyDataFromJson = Schema.parseJson(MyData);

const data = (jsonString: string) =>
	Schema.decodeUnknownSync(MyDataFromJson)(jsonString);

export { data };
