// Rule: Never use JSON.parse(); use Schema.parseJson()
// Example: Separate JSON.parse then validate (WRONG) (bad example)
// @rule-id: rule-003
// @category: schema
// @original-name: parse-json

import { Schema } from "effect";

// Define a schema for demonstration
const MySchema = Schema.Struct({
	name: Schema.String,
	age: Schema.Number,
});

// ❌ Bad: Two separate failure points
export function parseUserBad(jsonString: string) {
	const parsed = JSON.parse(jsonString); // Can throw!
	const validated = Schema.decodeUnknownSync(MySchema)(parsed);
	return validated;
}

export { MySchema };
