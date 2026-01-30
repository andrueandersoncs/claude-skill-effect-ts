// Rule: Never use ternary operators; define Schema types for each range and use Match.when with Schema.is
// Example: Nested ternary replaced with Schema-defined score ranges (bad example)
// @rule-id: rule-010
// @category: conditionals
// @original-name: ternary-to-match

declare const score: number;

// Bad: Using nested ternary operators instead of Match.when with Schema-defined ranges
const getLevel = (s: number): string =>
	s > 90 ? "expert" : s > 70 ? "intermediate" : "beginner";

export { getLevel, score };
