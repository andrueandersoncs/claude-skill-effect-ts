export type { Category, Pattern, Example } from "./types.js";

import { imperative } from "./imperative.js";
import { patternMatching } from "./pattern-matching.js";
import { schema } from "./schema.js";
import { errors } from "./errors.js";
import { testing } from "./testing.js";
import { nativeApis } from "./native-apis.js";
import { services } from "./services.js";
import { asyncPatterns } from "./async-patterns.js";

export const CATEGORIES = [
  imperative,
  patternMatching,
  schema,
  errors,
  testing,
  nativeApis,
  services,
  asyncPatterns,
];
