import type { Category } from "./types.js";

export const errors: Category = {
  id: "errors",
  name: "Error Handling",
  patterns: [
    "throw statements → Effect.fail()",
    "try/catch blocks → Effect.try() or Effect.tryPromise()",
    "Untyped errors → Schema.TaggedError",
  ],
};
