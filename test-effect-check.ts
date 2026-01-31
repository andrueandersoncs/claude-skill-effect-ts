// Test file with rule-002 violation - FIXED
import { Effect, Array as EffectArray, Function, Option } from "effect";

// Fixed: Using Effect.forEach with Array.from and Effect.log
// This eliminates mutation operators and uses functional iteration

const numbers = Effect.forEach(
  Array.from({ length: 10 }, (_, i) => i),
  (i) => Effect.log(i),
);

// Test null checking with Option and Match from task-003
const x = null;

Option.fromNullable(x).pipe(
  Option.match({
    onNone: () => console.log("null check - should use Match"),
    onSome: Function.constant(undefined),
  })
);

// Test Effect.gen with simple loop
export const example = () =>
	Effect.gen(function* () {
		for (let i = 0; i < 5; i++) {
			yield* Effect.logInfo(`Iteration ${i}`);
			yield* Effect.log(i);
		}
	});

export { numbers };
