export type { Category } from "./types.js";

import { imperative } from "./imperative.js";
import { tagAccess } from "./tag-access.js";
import { schema } from "./schema.js";
import { errors } from "./errors.js";
import { testing } from "./testing.js";

export const CATEGORIES = [imperative, tagAccess, schema, errors, testing];
