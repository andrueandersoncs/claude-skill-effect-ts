// Rule: Use Effect.catchTag/catchTags with Schema.TaggedError for type-safe error recovery
// Example: Error recovery patterns (bad examples)
// @rule-id: rule-002
// @category: errors
// @original-name: catch-tag-recovery

import { Data, Effect } from "effect";

// === Bad: Manual _tag checking ===

interface User {
	id: string;
	name: string;
}

interface UserNotFoundError {
	readonly _tag: "UserNotFound";
}

interface DatabaseError {
	readonly _tag: "DatabaseError";
}

type UserError = UserNotFoundError | DatabaseError;

declare function getUser(id: string): Effect.Effect<User, UserError>;
declare const defaultUser: User;

// ❌ Bad: Manual _tag checking in catchAll
export const getUserWithFallback = (id: string) =>
	getUser(id).pipe(
		Effect.catchAll((error) => {
			if (error._tag === "UserNotFound") {
				return Effect.succeed(defaultUser);
			}
			return Effect.fail(error);
		}),
	);

// === Bad: Switch on _tag ===

interface Order {
	id: string;
	total: number;
}

interface ValidationError {
	readonly _tag: "ValidationError";
	readonly message: string;
}

interface NotFoundError {
	readonly _tag: "NotFoundError";
}

interface BadRequest {
	readonly message: string;
}

declare function BadRequest(params: { message: string }): BadRequest;

type OrderError = ValidationError | NotFoundError;

declare function processOrder(order: Order): Effect.Effect<Order, OrderError>;
declare const defaultOrder: Order;

// ❌ Bad: Switch statement on error._tag
export const handleOrder = (order: Order) =>
	processOrder(order).pipe(
		Effect.catchAll((error) => {
			switch (error._tag) {
				case "ValidationError":
					return Effect.fail(BadRequest({ message: error.message }));
				case "NotFoundError":
					return Effect.succeed(defaultOrder);
				default:
					return Effect.fail(error);
			}
		}),
	);

// === Bad: Data.TaggedError instead of Schema.TaggedError ===

// ❌ Bad: Using Data.TaggedError (doesn't work with Schema.is)
class UserNotFoundBad extends Data.TaggedError("UserNotFoundBad")<{
	userId: string;
}> {}

declare const error: UserNotFoundBad | Error;

// ❌ Bad: Checking error._tag directly instead of using catchTag
const handleErrorBad = () => {
	if ("_tag" in error && error._tag === "UserNotFoundBad") {
		return defaultUser;
	}
	throw error;
};

// === Bad: Extending native Error ===

// ❌ Bad: Classes extending Error should use Schema.TaggedError
export class ValidationErrorClass extends Error {
	constructor(
		public field: string,
		message: string,
	) {
		super(message);
	}
}

export class NotFoundErrorClass extends Error {
	constructor(
		public resource: string,
		public id: string,
	) {
		super(`${resource} ${id} not found`);
	}
}

export { UserNotFoundBad, handleErrorBad };
