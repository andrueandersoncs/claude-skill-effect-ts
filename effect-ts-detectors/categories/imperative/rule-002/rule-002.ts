// Rule: Never reassign variables; use functional transformation
// Example: Building object with mutation
// @rule-id: rule-002
// @category: imperative
// @original-name: building-object-mutation

import { Array, pipe, Record } from "effect";

interface Item {
	key: string;
	value: number;
}

declare const items: ReadonlyArray<Item>;

// ✅ Good: Functional transformation with Record.fromEntries
const obj = pipe(
	items,
	Array.map((item) => [item.key, item.value] as const),
	Record.fromEntries,
);

export { obj };
