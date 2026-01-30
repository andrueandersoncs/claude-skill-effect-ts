// Rule: Never use switch/case statements; use Match.type with Match.tag for discriminated unions
// Example: Discriminated union event handling (bad example)
// @rule-id: rule-009
// @category: conditionals
// @original-name: switch-to-match-tag

import { Effect } from "effect";
import type { OrderId, UserId } from "../../_fixtures.js";

interface UserCreatedEvent {
	type: "UserCreated";
	userId: UserId;
}

interface UserDeletedEvent {
	type: "UserDeleted";
	userId: UserId;
}

interface OrderPlacedEvent {
	type: "OrderPlaced";
	orderId: OrderId;
}

type Event = UserCreatedEvent | UserDeletedEvent | OrderPlacedEvent;

declare function notifyAdmin(userId: UserId): Effect.Effect<void>;
declare function cleanupData(userId: UserId): Effect.Effect<void>;
declare function processOrder(orderId: OrderId): Effect.Effect<void>;

// Bad: Using switch/case instead of Match.tag for discriminated unions
const handleEvent = (event: Event): Effect.Effect<void> => {
	switch (event.type) {
		case "UserCreated":
			return notifyAdmin(event.userId);
		case "UserDeleted":
			return cleanupData(event.userId);
		case "OrderPlaced":
			return processOrder(event.orderId);
		default:
			return Effect.die(new Error("Unknown event"));
	}
};

export { handleEvent };
