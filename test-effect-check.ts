// Test file with rule-002 violation - FIXED
import { Effect, Array as EffectArray } from "effect";

// Fixed: Using Effect.forEach with Array.from and Effect.log
// This eliminates mutation operators and uses functional iteration

const numbers = Effect.forEach(
  Array.from({ length: 10 }, (_, i) => i),
  (i) => Effect.log(i),
);

export { numbers };
