// Rule: Never use negative conditions in if statements; define Schema types for each case and use Match.when with Schema.is
// Example: Numeric classification with Schema-defined ranges (bad example)
// @rule-id: rule-007
// @category: conditionals
// @original-name: numeric-classification

declare const n: number;

// Bad: Using negative conditions instead of Match.when with Schema-defined ranges
const classify = (num: number): string => {
	if (num > 0) {
		return "positive";
	} else {
		return "not positive";
	}
};

export { classify, n };
