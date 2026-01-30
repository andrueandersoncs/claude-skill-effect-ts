// Rule: Never use if/else on ._tag; use Match.tag for discriminated unions
// Example: Simple event dispatch

import { Match } from "effect";
import {
	type AppEvent,
	cleanupData,
	notifyAdmin,
	processOrderEvent,
} from "../_fixtures.js";

// ✅ Good: Match.tag for discriminated union dispatch
const handleEvent = Match.type<AppEvent>().pipe(
	Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
	Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
	Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
	Match.exhaustive,
);

export { handleEvent };
