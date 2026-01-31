// Rule: Always use Schema.Class for named/exported schemas
// Example: Bad patterns using Schema.Struct for named schemas
// @rule-id: rule-015
// @category: schema
// @original-name: schema-class-over-struct

import { Schema } from "effect";

// ❌ Bad: Schema.Struct assigned to a const
const User = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
});

// ❌ Bad: Schema.Struct with Schema suffix (common pattern to avoid)
const UserSchema = Schema.Struct({
	id: Schema.Number,
	email: Schema.String,
});

// ❌ Bad: Exported Schema.Struct
export const Order = Schema.Struct({
	orderId: Schema.String,
	items: Schema.Array(Schema.String),
});

// ❌ Bad: Schema.Struct assigned to let
const MutableSchema = Schema.Struct({
	value: Schema.String,
});

// ❌ Bad: Type extracted from Schema.Struct (should be a class)
type UserType = Schema.Schema.Type<typeof User>;

// ❌ Bad: Using .make() instead of new - indicates it should be a class
const createUser = () => User.make({ id: 1, name: "test" });

export { createUser, MutableSchema, User, UserSchema, type UserType };
