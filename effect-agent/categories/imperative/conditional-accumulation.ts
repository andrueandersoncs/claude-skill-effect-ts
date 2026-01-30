// Rule: Never use for...of/for...in; use Array module functions
// Example: Conditional accumulation

import { Array, pipe } from "effect";

interface Order {
	status: string;
	amount: number;
}

declare const orders: ReadonlyArray<Order>;

// ✅ Good: Array.filter + Array.reduce
const total = pipe(
	orders,
	Array.filter((o) => o.status === "completed"),
	Array.reduce(0, (acc, o) => acc + o.amount),
);

export { total };
