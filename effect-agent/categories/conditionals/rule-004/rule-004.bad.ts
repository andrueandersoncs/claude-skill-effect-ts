// Rule: Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is
// Example: Multi-condition assignment with Schema-defined conditions (bad example)
// @rule-id: rule-004
// @category: conditionals
// @original-name: multi-condition-assignment

declare const condition1: boolean;
declare const condition2: boolean;
declare const value1: string;
declare const value2: string;
declare const defaultValue: string;

// Bad: Using conditional variable reassignment instead of Match.when
const getResult = (): string => {
	let result = defaultValue;
	if (condition1) {
		result = value1;
	} else if (condition2) {
		result = value2;
	}
	return result;
};

export { getResult };
