// Rule: Never mutate variables (let, push, pop, splice); use immutable operations
// Example: Array splice/modification

import { Array, Function, Option, pipe } from "effect";

declare const items: ReadonlyArray<string>;
declare const newItem: string;

// ✅ Good: Immutable Array operations
const removed = pipe(items, Array.remove(2));

const inserted = pipe(
	items,
	Array.insertAt(1, newItem),
	Option.getOrElse(Function.constant(items)),
);

export { removed, inserted };
