// Rule: Never use switch/case statements; use Match.type with Match.tag for discriminated unions
// Example: Discriminated union event handling
// @rule-id: rule-009
// @category: conditionals
// @original-name: switch-to-match-tag

import { Match } from "effect";
import {
	type AppEvent,
	cleanupData,
	notifyAdmin,
	processOrderEvent,
} from "../../_fixtures.js";

// ✅ Good: Match.tag for exhaustive discriminated union handling
const handleEvent = (event: AppEvent) =>
	Match.value(event).pipe(
		Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
		Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
		Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
		Match.exhaustive,
	);

export { handleEvent };
