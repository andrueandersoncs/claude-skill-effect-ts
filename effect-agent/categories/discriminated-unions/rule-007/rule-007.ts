// Rule: Never extract types from ._tag; use the union type directly
// Example: Extracting _tag as a type
// @rule-id: rule-007
// @category: discriminated-unions
// @original-name: use-union-directly

import { Match, Schema } from "effect";
import {
	type AppEvent,
	cleanupData,
	notifyAdmin,
	processOrderEvent,
	UserCreated,
} from "../../_fixtures.js";

// ✅ Good: Use Schema.is for type narrowing
const isUserCreated = Schema.is(UserCreated);

// ✅ Good: Use Match.tag for exhaustive handling
const handleAll = Match.type<AppEvent>().pipe(
	Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
	Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
	Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
	Match.exhaustive,
);

// ✅ Good: Use the union type for function parameters
const handleEventUnion = (event: AppEvent) =>
	Match.value(event).pipe(
		Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
		Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
		Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
		Match.exhaustive,
	);

export { isUserCreated, handleAll, handleEventUnion };
