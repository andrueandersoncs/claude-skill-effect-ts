import { Schema } from "effect";

// Check if we can validate object type through schema
const ObjectSchema = Schema.Object;

const isObjectType = (u: unknown): u is object =>
	Schema.is(ObjectSchema)(u);

// Test it
console.log("Object check with schema:");
console.log("null:", isObjectType(null));
console.log("{}:", isObjectType({}));
console.log("[]:", isObjectType([]));
console.log("'string':", isObjectType("string"));
console.log("123:", isObjectType(123));
