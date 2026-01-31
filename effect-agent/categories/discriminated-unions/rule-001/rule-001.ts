// Rule: Never use if/else, switch/case, or direct ._tag access on discriminated unions
// @rule-id: rule-001
// @category: discriminated-unions
// @original-name: match-tag-dispatch

import { Match, Schema } from "effect";
import {
	type AppEvent,
	cleanupData,
	Delivered,
	notifyAdmin,
	type OrderStatus,
	Pending,
	processOrderEvent,
	Shipped,
	UserCreated,
} from "../../_fixtures.js";

// ------------------------------------------------
// Example 1: Match.tag for exhaustive dispatch
// ------------------------------------------------
// ✅ Good: Match.tag for discriminated union dispatch
const handleEvent = Match.type<AppEvent>().pipe(
	Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
	Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
	Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
	Match.exhaustive,
);

// ------------------------------------------------
// Example 2: Match.when with Schema.is for type narrowing
// ------------------------------------------------
// ✅ Good: Match.when with Schema.is for type narrowing
const getOrderStatus = (order: OrderStatus) =>
	Match.value(order).pipe(
		Match.when(Schema.is(Pending), () => "Awaiting shipment"),
		Match.when(Schema.is(Shipped), (o) => `Tracking: ${o.trackingNumber}`),
		Match.when(Schema.is(Delivered), (o) => `Delivered ${o.deliveredAt}`),
		Match.exhaustive,
	);

// ------------------------------------------------
// Example 3: Schema.is for single-variant checks
// ------------------------------------------------
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

export {
	handleEvent,
	getOrderStatus,
	isUserCreated,
	handleAll,
	handleEventUnion,
};
