import type { Category } from "./types.js";

export const schema: Category = {
  id: "schema",
  name: "Schema Anti-Patterns",
  patterns: [
    "Plain TypeScript interfaces → Schema.Class or Schema.Struct",
    "Schema.Struct for domain entities → Schema.Class (with methods)",
    "Optional properties for state → Tagged unions",
    "Schema.Any/Schema.Unknown → Proper typed schemas",
    "JSON.parse() → Schema.parseJson()",
  ],
};
