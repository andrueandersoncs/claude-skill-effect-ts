// Rule: Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass
// Example: Effect success/failure handling with Schema-defined result types
// @rule-id: rule-008
// @category: conditionals
// @original-name: result-effect-match

import { Effect, Schema } from "effect";
import {
	getUser,
	User,
	type UserId,
	type UserNotFound,
} from "../../_fixtures.js";

class ErrorResult extends Schema.TaggedClass<ErrorResult>()("ErrorResult", {
	status: Schema.Literal("error"),
	message: Schema.String,
}) {}

class SuccessResultType extends Schema.TaggedClass<SuccessResultType>()(
	"SuccessResult",
	{
		status: Schema.Literal("success"),
		user: User,
	},
) {}

declare const id: UserId;

// ✅ Good: Effect.match with Schema-defined result types
const fetchResult = Effect.match(getUser(id), {
	onFailure: (error: UserNotFound) =>
		new ErrorResult({ status: "error", message: error.userId }),
	onSuccess: (user) => new SuccessResultType({ status: "success", user }),
});

export { fetchResult };
