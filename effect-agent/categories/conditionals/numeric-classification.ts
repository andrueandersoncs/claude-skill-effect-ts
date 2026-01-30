// Rule: Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is
// Example: Numeric classification with Schema-defined ranges

import { Function, Match, Schema } from "effect";

const Zero = Schema.Literal(0);
const Negative = Schema.Number.pipe(Schema.negative());
const Positive = Schema.Number.pipe(Schema.positive());

// ✅ Good: Match.when with Schema.is for numeric classification
const classify = Match.type<number>().pipe(
	Match.when(Schema.is(Zero), Function.constant("zero")),
	Match.when(Schema.is(Negative), Function.constant("negative")),
	Match.when(Schema.is(Positive), Function.constant("positive")),
	Match.exhaustive,
);

export { classify };
