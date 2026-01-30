// Rule: Never check ._tag directly; use Schema.is(Variant)
// Example: Switch on _tag property (bad example)
// @rule-id: rule-006
// @category: discriminated-unions
// @original-name: switch-on-tag

import type { OrderStatus } from "../../_fixtures.js";

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

export { getStatusMessageBad };
