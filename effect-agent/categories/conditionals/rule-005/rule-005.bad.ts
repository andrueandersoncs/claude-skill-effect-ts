// Rule: Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is
// Example: Multi-condition object matching with Schema-defined predicates (bad example)
// @rule-id: rule-005
// @category: conditionals
// @original-name: multi-condition-matching

interface OrderInput {
	total: number;
	isPremium: boolean;
}

declare const order: OrderInput;

// Bad: Using if/else chains instead of Match.when with Schema-defined predicates
const getDiscount = (o: OrderInput): number => {
	if (o.total > 1000 && o.isPremium) {
		return 0.25;
	} else if (o.total > 1000) {
		return 0.15;
	} else if (o.isPremium) {
		return 0.1;
	} else {
		return 0;
	}
};

export { getDiscount, order };
