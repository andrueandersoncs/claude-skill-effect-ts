import type { Category } from "./types.js";

export const testing: Category = {
  id: "testing",
  name: "Testing Anti-Patterns",
  patterns: [
    "Effect.runPromise in tests → it.effect from @effect/vitest",
    'import { it } from "vitest" → import { it } from "@effect/vitest"',
    "Hard-coded test data → Arbitrary.make(Schema)",
  ],
};
