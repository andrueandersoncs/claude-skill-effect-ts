// Rule: Never use Promise chains (.then); use pipe with Effect.map/flatMap
// Example: Promise chain with transformation
// @rule-id: rule-005
// @category: async
// @original-name: promise-chain

import { Array, Effect, pipe } from "effect";
import { fetchData, type Item } from "../_fixtures.js";

// ✅ Good: pipe with Effect.map for transformations
const result = pipe(
	fetchData(),
	Effect.map((data) => data.items),
	Effect.map(Array.filter((i: Item) => i.active)),
	Effect.map(Array.map((i: Item) => i.id)),
);

export { result };
