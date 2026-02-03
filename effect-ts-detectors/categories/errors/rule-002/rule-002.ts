// Rule: Use Effect.catchTag/catchTags with Schema.TaggedError for type-safe error recovery
// Example: Error recovery patterns with typed errors
// @rule-id: rule-002
// @category: errors
// @original-name: catch-tag-recovery

import { Effect, Match, Schema } from "effect";
import {
	BadRequest,
	defaultOrder,
	defaultUser,
	getUser,
	type Order,
	type UserId,
	UserNotFound,
} from "../../_fixtures.js";

declare const id: UserId;
declare const error: unknown;

// Schema.TaggedError definitions for local use
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

// ✅ Good: Effect.catchTag for single error type recovery
const catchTagResult = getUser(id).pipe(
	Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser)),
);

// ✅ Good: Effect.catchTags for multiple error types
const catchTagsResult = processOrderFn(order).pipe(
	Effect.catchTags({
		ValidationError: (e) => Effect.fail(new BadRequest({ message: e.message })),
		NotFoundError: () => Effect.succeed(defaultOrder),
	}),
);

// ✅ Good: Schema.TaggedError works with Match.tag
const handleError = (e: UserNotFound) =>
	Match.value(e).pipe(
		Match.tag("UserNotFound", () => Effect.succeed(defaultUser)),
		Match.exhaustive,
	);

// ✅ Good: Schema.is works with Schema.TaggedError inside Match
const withSchemaIs = Match.value(error).pipe(
	Match.when(Schema.is(UserNotFound), () => defaultUser),
	Match.orElse(() => Effect.die("Unknown error")),
);

export { catchTagResult, catchTagsResult, handleError, withSchemaIs };
