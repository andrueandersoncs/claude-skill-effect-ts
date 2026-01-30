// Rule: Never use manual batching for large sequences; use Stream
// Example: Chunked processing with concurrency
// @rule-id: rule-003
// @category: imperative
// @original-name: chunked-processing

import { Array, Chunk, Effect, Stream } from "effect";
import { processItem } from "../_fixtures.js";

declare const items: ReadonlyArray<string>;

// ✅ Good: Stream with grouped batching
const goodExample = Effect.gen(function* () {
	const results = yield* Stream.fromIterable(items).pipe(
		Stream.grouped(100),
		Stream.mapEffect((batch) =>
			Effect.all(Array.map(Chunk.toReadonlyArray(batch), processItem), {
				concurrency: "unbounded",
			}),
		),
		Stream.runCollect,
	);
	return results;
});

export { goodExample };
