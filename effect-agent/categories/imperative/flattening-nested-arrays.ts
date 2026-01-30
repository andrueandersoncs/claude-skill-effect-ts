// Rule: Never use nested for loops; use Array.flatMap
// Example: Flattening nested arrays

import { Array } from "effect";
import type { Post } from "../_fixtures.js";

declare const posts: ReadonlyArray<Post>;

// ✅ Good: Array.flatMap for nested structure
const allTags = Array.flatMap(posts, (post) => post.tags);

export { allTags };
