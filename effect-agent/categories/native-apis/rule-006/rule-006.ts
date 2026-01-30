// Rule: Never use array.find(); use Array.findFirst (returns Option)
// Example: Finding with default
// @rule-id: rule-006
// @category: native-apis
// @original-name: finding-with-default

import { Array, Function, Option, pipe } from "effect";
import { defaultItem, type Item } from "../_fixtures.js";

declare const items: ReadonlyArray<Item>;
declare const targetId: string;

// ✅ Good: Array.findFirst with Option.getOrElse
const found = pipe(
	Array.findFirst(items, (i) => i.id === targetId),
	Option.getOrElse(Function.constant(defaultItem)),
);

export { found };
