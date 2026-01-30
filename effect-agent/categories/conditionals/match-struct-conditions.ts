// Rule: Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is
// Example: Matching multiple conditions with Schema.Struct

import { Function, Match, Schema } from "effect";
import type { User } from "../_fixtures.js";

const VerifiedAdmin = Schema.Struct({
	role: Schema.Literal("admin"),
	verified: Schema.Literal(true),
});

// ✅ Good: Match.when with Schema.is for struct conditions
const canDelete = Match.type<User>().pipe(
	Match.when(Schema.is(VerifiedAdmin), Function.constant(true)),
	Match.orElse(Function.constant(false)),
);

export { canDelete };
