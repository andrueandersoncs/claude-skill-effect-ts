// Rule: Never use if/else, switch/case, or direct ._tag access on discriminated unions
// @rule-id: rule-001
// @category: discriminated-unions
// @original-name: match-tag-dispatch

import type { AppEvent, OrderStatus } from "../../_fixtures.js";
import { cleanupData, logEvent, notifyAdmin } from "../../_fixtures.js";

// ------------------------------------------------
// Example 1: Using if/else to check ._tag
// ------------------------------------------------
// ❌ Bad: Using if/else to check ._tag
const handleEventBad = (event: AppEvent) => {
	if (event._tag === "UserCreated") {
		return notifyAdmin(event.userId);
	} else if (event._tag === "UserDeleted") {
		return cleanupData(event.userId);
	} else {
		return logEvent(event);
	}
};

// ------------------------------------------------
// Example 2: Using switch on ._tag directly
// ------------------------------------------------
// ❌ Bad: Using switch on ._tag directly
function getStatusMessageBad(order: OrderStatus): string {
	switch (order._tag) {
		case "Pending":
			return "Awaiting shipment";
		case "Shipped":
			return `Tracking: ${order.trackingNumber}`;
		case "Delivered":
			return `Delivered ${order.deliveredAt}`;
	}
}

// ------------------------------------------------
// Example 3: Extracting _tag as a type
// ------------------------------------------------
// ❌ Bad: Extracting _tag as a type loses type safety
type EventType = AppEvent["_tag"];

// Using extracted tag loses type safety
const handleByTagBad = (tag: EventType) => {
	// Can't access event properties, only have the tag string
	console.log(tag);
};

export { handleEventBad, getStatusMessageBad, type EventType, handleByTagBad };
