// Rule: Never check ._tag directly; use Schema.is(Variant)
// Example: Switch on _tag property
// @rule-id: rule-006
// @category: discriminated-unions
// @original-name: switch-on-tag

import { Match, Schema } from "effect";
import {
	Delivered,
	type OrderStatus,
	Pending,
	Shipped,
} from "../../_fixtures.js";

// ✅ Good: Match.when with Schema.is for type narrowing
const getOrderStatus = (order: OrderStatus) =>
	Match.value(order).pipe(
		Match.when(Schema.is(Pending), () => "Awaiting shipment"),
		Match.when(Schema.is(Shipped), (o) => `Tracking: ${o.trackingNumber}`),
		Match.when(Schema.is(Delivered), (o) => `Delivered ${o.deliveredAt}`),
		Match.exhaustive,
	);

export { getOrderStatus };
