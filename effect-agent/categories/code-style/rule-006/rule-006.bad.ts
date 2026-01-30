// Rule: Use Effect.gen() for multi-step sequential operations
// Example: Multiple dependent operations (bad example)
// @rule-id: rule-006
// @category: code-style
// @original-name: effect-gen-multi-step

import { Effect } from "effect";

interface Order {
	id: string;
	items: string[];
}

interface ValidatedOrder extends Order {
	validated: true;
}

interface SavedOrder extends ValidatedOrder {
	savedAt: Date;
}

declare const getOrder: (id: string) => Effect.Effect<Order>;
declare const validateOrder: (order: Order) => Effect.Effect<ValidatedOrder>;
declare const saveOrder: (order: ValidatedOrder) => Effect.Effect<SavedOrder>;

// BAD: Deeply nested flatMap chain instead of Effect.gen
export const processOrder = (orderId: string) =>
	getOrder(orderId).pipe(
		Effect.flatMap((order) =>
			validateOrder(order).pipe(
				Effect.flatMap((validated) =>
					saveOrder(validated).pipe(
						Effect.map((saved) => ({ order: saved, status: "completed" })),
					),
				),
			),
		),
	);
