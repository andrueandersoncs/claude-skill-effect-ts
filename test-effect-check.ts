import * as Effect from "effect/Effect";

const numbers = Effect.forEach(
  Array.from({ length: 10 }, (_, i) => i),
  (i) => Effect.log(i)
);
