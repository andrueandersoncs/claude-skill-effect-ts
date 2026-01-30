// Rule: Never add comments describing WHAT code does; the code itself shows that
// Example: Function implementation (bad example)
// @rule-id: rule-005
// @category: comments
// @original-name: function-implementation

import { Effect } from "effect";
import { Database, type UserId } from "../../_fixtures.js";

// ❌ Bad: Comment describes what the code does
// Get the user from the database
const getUserBad = (id: UserId) =>
	Effect.gen(function* () {
		const db = yield* Database;
		return yield* db.findUser(id);
	});

export { getUserBad };
