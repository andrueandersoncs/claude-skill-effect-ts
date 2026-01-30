// Rule: Never use the function keyword; use fat arrow syntax
// Example: Function declarations (bad example)
// @rule-id: rule-008
// @category: code-style
// @original-name: fat-arrow-syntax

interface Item {
	value: number;
}

interface Event {
	data: unknown;
}

// BAD: Using 'function' keyword instead of arrow function
export function processItems(items: Array<Item>): number {
	return items.reduce((sum, item) => sum + item.value, 0);
}

export const handler = (event: Event): unknown => event.data;
