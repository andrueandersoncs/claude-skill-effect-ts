// Rule: Never use ternary operators; define Schema types for each range and use Match.when with Schema.is
// Example: Nested ternary replaced with Schema-defined score ranges
// @rule-id: rule-010
// @category: conditionals
// @original-name: ternary-to-match

import { Function, Match, Schema } from "effect";

const ExpertScore = Schema.Number.pipe(Schema.greaterThan(90));
const IntermediateScore = Schema.Number.pipe(Schema.greaterThan(70));

declare const score: number;

// ✅ Good: Match.when with Schema.is for ranges
const level = Match.value(score).pipe(
	Match.when(Schema.is(ExpertScore), Function.constant("expert")),
	Match.when(Schema.is(IntermediateScore), Function.constant("intermediate")),
	Match.orElse(Function.constant("beginner")),
);

export { level };
