// Rule: Never use raw primitives for IDs; use Schema.brand
// Example: Unbranded ID types (bad example)
// @rule-id: rule-001
// @category: schema
// @original-name: branded-ids

import { Schema } from "effect";

// ❌ Bad: Using raw strings for IDs
const UserBad = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
});

// Nothing prevents mixing up userId and orderId
const getOrderBad = (_orderId: string) => {};

// Oops! Can pass any string, including wrong ID types
declare const user: typeof UserBad.Type;
getOrderBad(user.id); // No type error, but semantically wrong!

export { UserBad, getOrderBad };
