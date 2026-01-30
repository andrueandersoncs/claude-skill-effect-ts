// Rule: Never use record[key]; use Record.get (returns Option)
// Example: Safe property access
// @rule-id: rule-013
// @category: native-apis
// @original-name: safe-property-access

import { Effect, Option, pipe, Record } from "effect";

class ItemNotFound {
	readonly _tag = "ItemNotFound";
	constructor(readonly itemId: string) {}
}

declare const prices: Record<string, number>;
declare const itemId: string;
declare const calculateTotal: (price: number) => Effect.Effect<number>;

// ✅ Good: Record.get with Option.match
const priceEffect = pipe(
	Record.get(prices, itemId),
	Option.match({
		onNone: () => Effect.fail(new ItemNotFound(itemId)),
		onSome: (price) => calculateTotal(price),
	}),
);

export { priceEffect };
