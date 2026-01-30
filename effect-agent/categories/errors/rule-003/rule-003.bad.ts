// Rule: Never use switch on error._tag; use Effect.catchTags
// Example: Handling multiple error types (bad example)
// @rule-id: rule-003
// @category: errors
// @original-name: catch-tags

import { Effect } from "effect";

// Declare types and external functions
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

// ❌ Bad:
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
