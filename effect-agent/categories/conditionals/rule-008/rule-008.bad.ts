// Rule: Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass
// Example: Effect success/failure handling with Schema-defined result types (bad example)
// @rule-id: rule-008
// @category: conditionals
// @original-name: result-effect-match

import { Effect } from "effect";
import { getUser, type UserId } from "../../_fixtures.js";

declare const id: UserId;

interface ResultWithStatus {
	status: "success" | "error";
	user?: unknown;
	message?: string;
}

// Bad: Using try/catch with status flags instead of Effect.match
const fetchUser = async (userId: UserId): Promise<ResultWithStatus> => {
	try {
		const user = await Effect.runPromise(getUser(userId));
		return { status: "success", user };
	} catch (error) {
		return { status: "error", message: (error as Error).message };
	}
};

export { fetchUser, id };
