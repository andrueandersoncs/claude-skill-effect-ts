// Rule: Never use (x) => x; use Function.identity
// Example: Conditional transformation
// @rule-id: rule-002
// @category: native-apis
// @original-name: conditional-transformation

import { Function, Match } from "effect";
import { myTransform, shouldTransform } from "../_fixtures.js";

// ✅ Good: Function.identity and Function.constant
const transform = Match.value(shouldTransform).pipe(
	Match.when(true, Function.constant(myTransform)),
	Match.orElse(Function.constant(Function.identity)),
);

export { transform };
