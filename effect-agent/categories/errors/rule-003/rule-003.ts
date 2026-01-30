// Rule: Never use switch on error._tag; use Effect.catchTags
// Example: Handling multiple error types
// @rule-id: rule-003
// @category: errors
// @original-name: catch-tags

import { Effect, Schema } from "effect";
import { BadRequest, defaultOrder, type Order } from "../../_fixtures.js";

class LocalValidationError extends Schema.TaggedError<LocalValidationError>()(
	"ValidationError",
	{
		message: Schema.String,
	},
) {}

class LocalNotFoundError extends Schema.TaggedError<LocalNotFoundError>()(
	"NotFoundError",
	{
		message: Schema.String,
	},
) {}

declare const processOrderFn: (
	order: Order,
) => Effect.Effect<Order, LocalValidationError | LocalNotFoundError>;
declare const order: Order;

// ✅ Good: Effect.catchTags for multiple error types
const result = processOrderFn(order).pipe(
	Effect.catchTags({
		ValidationError: (e) => Effect.fail(new BadRequest({ message: e.message })),
		NotFoundError: () => Effect.succeed(defaultOrder),
	}),
);

export { result };
