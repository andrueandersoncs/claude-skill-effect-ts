// Rule: Never use tuple[0]/tuple[1]; use Tuple.getFirst/getSecond
// Example: Tuple transformation (bad example)
// @rule-id: rule-015
// @category: native-apis
// @original-name: tuple-transformation

// Declare external variables
declare const pair: readonly [string, number];

// Bad: Direct tuple index access instead of Tuple.getFirst/getSecond
export const transformed = [pair[0].toUpperCase(), pair[1] * 2] as const;
