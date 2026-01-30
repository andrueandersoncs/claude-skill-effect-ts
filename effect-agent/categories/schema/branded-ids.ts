// Rule: Never use raw primitives for IDs; use Schema.brand
// Example: Unbranded ID types

import { Schema } from "effect";

// ✅ Good: Branded IDs prevent mixing up IDs
const UserId = Schema.String.pipe(Schema.brand("UserId"));
const OrderId = Schema.String.pipe(Schema.brand("OrderId"));
const Email = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/));

class User extends Schema.Class<User>("User")({
	id: UserId,
	email: Email,
}) {}

// Type system prevents: getOrder(user.id) - wrong ID type!
const getOrder = (_orderId: typeof OrderId.Type) => {};

export { User, getOrder };
