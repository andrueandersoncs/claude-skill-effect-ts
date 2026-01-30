// Rule: Never use angle bracket casting (<Type>value); use Schema
// Example: Old-style type assertion (bad example)
// @rule-id: rule-001
// @category: code-style
// @original-name: dom-element

// BAD: Angle bracket type assertion
export const getInputElement = (): HTMLInputElement | null => {
	const element = <HTMLInputElement>document.getElementById("input");
	return element;
};
