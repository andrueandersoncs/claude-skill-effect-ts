// Rule: Never use manual type conversions; use Schema.transform
// Example: Domain transformation (cents to dollars)

import { Schema } from "effect";

// ✅ Good: Schema.transform captures the transformation bidirectionally
const Dollars = Schema.transform(
	Schema.Number.pipe(Schema.int()), // Cents (external/encoded)
	Schema.Number, // Dollars (internal/decoded)
	{
		decode: (cents) => cents / 100,
		encode: (dollars) => Math.round(dollars * 100),
		strict: true,
	},
);

// API sends cents, code works with dollars
const price = Schema.decodeSync(Dollars)(4999); // → 49.99

export { Dollars, price };
