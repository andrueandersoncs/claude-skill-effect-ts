import { Effect } from "effect";

export const example = () =>
	Effect.gen(function* () {
		for (let i = 0; i < 5; i++) {
			yield* Effect.logInfo(`Iteration ${i}`);
			yield* Effect.log(i);
		}
	});
