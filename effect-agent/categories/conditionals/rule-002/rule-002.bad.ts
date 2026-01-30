// Rule: Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is
// Example: Matching any of several values with Schema.Literal union (bad example)
// @rule-id: rule-002
// @category: conditionals
// @original-name: match-literal-union

declare const day: string;

// Bad: Using multiple OR conditions instead of Schema.Literal union with Match.when
const isWeekend = (d: string): boolean => {
	if (d === "Saturday" || d === "Sunday") {
		return true;
	}
	return false;
};

export { isWeekend, day };
